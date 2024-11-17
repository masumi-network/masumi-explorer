import { NextResponse } from "next/server";
import { Agent, AssetListItem } from "@/types/agent";

const BLOCKFROST_API_KEY = 'preprodhrtK1nyhYpdtYRKQjmUDxpgGqzY7uyEq';
const POLICY_ID = '97caadc87d40ed22ccd07db3f062c1d3b534a7a9c7534e9aa8857121';
const BASE_URL = 'https://cardano-preprod.blockfrost.io/api/v0';
const RESULTS_PER_PAGE = 100;  // Blockfrost maximum

async function blockfrostFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryParams ? '?' + queryParams : ''}`;
  
  console.log('Fetching:', url); // Debug log

  const response = await fetch(url, {
    headers: {
      'project_id': BLOCKFROST_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Blockfrost API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

async function getAllAssets(): Promise<{ total: number; active: number; assets: AssetListItem[] }> {
  let currentPage = 1;
  let allAssets: AssetListItem[] = [];
  
  while (true) {
    const assets = await blockfrostFetch<AssetListItem[]>(
      `/assets/policy/${POLICY_ID}`, 
      {
        page: currentPage.toString(),
        count: RESULTS_PER_PAGE.toString(),
        order: 'desc' // newest first
      }
    );

    console.log(`Page ${currentPage}:`, assets.length, 'assets'); // Debug log

    allAssets = [...allAssets, ...assets];

    // If we got fewer results than the maximum per page, we're done
    if (assets.length < RESULTS_PER_PAGE) {
      break;
    }

    currentPage++;
  }

  // Calculate totals
  const total = allAssets.length;
  const active = allAssets.filter(asset => asset.quantity !== "0").length;

  console.log('Total assets:', total, 'Active:', active); // Debug log

  return {
    total,
    active,
    assets: allAssets
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    // Get all assets and stats
    const { total, active, assets } = await getAllAssets();
    
    // Get details for the limited number of assets
    const assetsToProcess = limit 
      ? assets.slice(0, parseInt(limit))
      : assets;

    // Get details for each asset
    const agentsDetails = await Promise.all(
      assetsToProcess.map(async (asset) => {
        try {
          const details = await blockfrostFetch<Agent>(`/assets/${asset.asset}`);
          return details;
        } catch (error) {
          console.error(`Error fetching details for asset ${asset.asset}:`, error);
          return null;
        }
      })
    );

    const filteredAgents = agentsDetails.filter((agent): agent is Agent => agent !== null);

    return NextResponse.json({
      totalAgents: total,
      activeAgents: active,
      agents: filteredAgents,
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch agents',
      details: error.message,
    }, { 
      status: 500 
    });
  }
}