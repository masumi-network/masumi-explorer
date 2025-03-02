import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { storage } from "../storage";
import { insertTransactionSchema, insertAgentSchema } from "@shared/schema";

interface BlockfrostConfig {
  projectId: string;
  network: "preprod" | "mainnet";
}

const PREPROD_CONFIG: BlockfrostConfig = {
  projectId: "preprodyAaq0Es1UnScwBp5vxdBH7ks2IbBaRro",
  network: "preprod"
};

const MAINNET_CONFIG: BlockfrostConfig = {
  projectId: "mainnetD813pPbW5SjD3oa6HbNVcy72eDJTsxgF",
  network: "mainnet"
};

export class BlockfrostService {
  private client: BlockFrostAPI;
  private readonly config: BlockfrostConfig;
  private readonly watchedAddress: string;
  private readonly policyId: string;
  private readonly networkName: string; // Add explicit network name

  constructor(network: "preprod" | "mainnet") {
    this.config = network === "preprod" ? PREPROD_CONFIG : MAINNET_CONFIG;
    this.client = new BlockFrostAPI({
      projectId: this.config.projectId,
      network: this.config.network
    });
    // Standardize network names to match UI
    this.networkName = network === "preprod" ? "Preprod" : "Mainnet";
    this.watchedAddress = network === "preprod"
      ? "addr_test1wzlwhustapq9ck0zdz8dahhwd350nzlpg785nz7hs0tqjtgdy4230"
      : "addr1wxlwhustapq9ck0zdz8dahhwd350nzlpg785nz7hs0tqjtgkvpk72";
    this.policyId = network === "preprod"
      ? "0520e542b4704586b7899e8af207501fd1cfb4d12fc419ede7986de8"
      : "ec878babd6cbd840ae7745a74356b271a24a4391fd6a27e855572fc4";
  }

  private decodeAssetName(assetNameHex: string): string {
    try {
      const decoded = Buffer.from(assetNameHex, 'hex').toString('utf8');
      return decoded.replace(/\0/g, '');
    } catch (error) {
      console.error(`[BlockfrostService][${this.networkName}] Error decoding asset name: ${assetNameHex}`, error);
      return `Asset ${assetNameHex.slice(0, 8)}`;
    }
  }

  private async processAsset(asset: any) {
    try {
      console.log(`[BlockfrostService][${this.networkName}] Processing asset:`, {
        asset_id: asset.asset,
        quantity: asset.quantity
      });

      const assetInfo = await this.client.assetsById(asset.asset);
      if (!assetInfo.initial_mint_tx_hash) {
        console.error(`[BlockfrostService][${this.networkName}] No mint transaction hash found for asset:`, asset.asset);
        return null;
      }

      const txInfo = await this.client.txs(assetInfo.initial_mint_tx_hash);
      if (!txInfo.block_time) {
        console.error(`[BlockfrostService][${this.networkName}] No block time found for transaction:`, assetInfo.initial_mint_tx_hash);
        return null;
      }

      const mintDate = new Date(txInfo.block_time * 1000);
      const assetNameHex = asset.asset.slice(this.policyId.length);
      const agentName = this.decodeAssetName(assetNameHex);

      const insertData = {
        name: Array.isArray(assetInfo.onchain_metadata?.name)
          ? assetInfo.onchain_metadata.name[0]
          : agentName,
        description: Array.isArray(assetInfo.onchain_metadata?.description)
          ? assetInfo.onchain_metadata.description[0]
          : (assetInfo.onchain_metadata?.description || `Asset ${asset.asset.slice(0, 8)}`),
        creatorName: Array.isArray(assetInfo.onchain_metadata?.author?.name)
          ? assetInfo.onchain_metadata.author.name[0]
          : "Blockchain",
        metadata: {
          assetId: asset.asset,
          quantity: asset.quantity,
          onchainMetadata: assetInfo.onchain_metadata || {},
          mintTransaction: assetInfo.initial_mint_tx_hash,
          network: this.networkName, // Use standardized network name
          capabilities: ["blockchain_interaction"]
        },
        createdAt: mintDate
      };

      console.log(`[BlockfrostService][${this.networkName}] Created agent data:`, {
        name: insertData.name,
        network: insertData.metadata.network,
        createdAt: insertData.createdAt.toISOString()
      });

      const agent = insertAgentSchema.parse(insertData);
      return agent;
    } catch (error) {
      console.error(`[BlockfrostService][${this.networkName}] Error processing asset ${asset.asset}:`, error);
      return null;
    }
  }

  async fetchLatestAssets(page = 1): Promise<void> {
    try {
      console.log(`[BlockfrostService][${this.networkName}] Fetching assets for policy ${this.policyId}, page ${page}`);
      const assets = await this.client.assetsPolicyById(this.policyId, {
        page,
        count: 100,
        order: 'desc'
      });

      console.log(`[BlockfrostService][${this.networkName}] Found ${assets.length} assets`);

      for (const asset of assets) {
        try {
          const existing = await storage.getAgentByAssetId(asset.asset);
          if (!existing) {
            const agent = await this.processAsset(asset);
            if (agent) {
              await storage.createAgent(agent);
              console.log(`[BlockfrostService][${this.networkName}] Created new agent: ${agent.name}`);
            }
          }
        } catch (error) {
          console.error(`[BlockfrostService][${this.networkName}] Error handling asset ${asset.asset}:`, error);
        }
      }

      if (assets.length === 100) {
        await this.fetchLatestAssets(page + 1);
      }
    } catch (error) {
      console.error(`[BlockfrostService][${this.networkName}] Error fetching assets:`, error);
    }
  }

  async fetchLatestTransactions(page = 1): Promise<void> {
    try {
      console.log(`[BlockfrostService][${this.networkName}] Fetching transactions for address ${this.watchedAddress}, page ${page}`);
      const transactions = await this.client.addressesTransactions(this.watchedAddress, {
        page,
        count: 100,
        order: 'desc'
      });

      for (const tx of transactions) {
        try {
          const existing = await storage.getTransactionByHash(tx.tx_hash);
          if (!existing) {
            const transaction = insertTransactionSchema.parse({
              transactionId: tx.tx_hash,
              transactionType: 'blockchain_tx',
              network: this.networkName, // Use standardized network name
              timestamp: new Date(tx.block_time * 1000).toISOString()
            });
            await storage.createTransaction(transaction);
            console.log(`[BlockfrostService][${this.networkName}] Created new transaction: ${tx.tx_hash}`);
          }
        } catch (error) {
          console.error(`[BlockfrostService][${this.networkName}] Error processing transaction ${tx.tx_hash}:`, error);
        }
      }

      if (transactions.length === 100) {
        await this.fetchLatestTransactions(page + 1);
      }
    } catch (error) {
      console.error(`[BlockfrostService][${this.networkName}] Error fetching transactions:`, error);
    }
  }
}