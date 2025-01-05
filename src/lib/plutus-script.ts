import { applyParamsToScript } from '@meshsdk/core';
import { deserializePlutusScript as meshDeserializePlutusScript } from '@meshsdk/core-cst';
import { blueprint } from './plutus';

export interface PlutusScript {
  code: string;
  version: 'V1' | 'V2' | 'V3';
}

export function deserializePlutusScript(code: string, version: PlutusScript['version']) {
  return meshDeserializePlutusScript(code, version);
}

export function createPlutusScript(paymentContractAddress: string): PlutusScript {
  return {
    code: applyParamsToScript(blueprint.validators[0].compiledCode, [
      paymentContractAddress,
    ]),
    version: 'V3'
  };
}

export const PAYMENT_CONTRACT_ADDRESS = 'addr_test1wr3hvt2hw89l6ay85lr0f2nr80tckrnpjr808dxhq39xkssvw7mx8';
export const POLICY_ID = 'c7842ba56912a2df2f2e1b89f8e11751c6ec2318520f4d312423a272';
  </rewritten_file> 