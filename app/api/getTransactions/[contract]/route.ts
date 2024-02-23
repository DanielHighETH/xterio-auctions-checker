import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ApiResponse, TransactionCount } from '@/app/lib/types';

export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { contract: string } }) {
    const apiKey: string = process.env.ETHERSCAN_API_KEY || '';
    const contract = params.contract;

    if (!contract) {
        return NextResponse.json({ error: "Contract address is required" }, { status: 400 });
    }
    if (!apiKey) {
        return NextResponse.json({ error: "Etherscan API key is required" }, { status: 500 });
    }

    let startBlock = 0;
    const maxBlock = 99999999;
    let keepFetching = true;
    const transactionCounts: TransactionCount = {};

    try {
        while (keepFetching) {
            const apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${contract}&startblock=${startBlock}&endblock=${maxBlock}&sort=asc&apikey=${apiKey}`;
            const response = await axios.get<ApiResponse>(apiUrl);

            response.data.result.forEach(transaction => {
                if (transaction.isError === "0" && transaction.functionName?.startsWith("placeBid")) {
                    const valueInEth = (parseInt(transaction.value) / 1e18).toFixed(2);
                    const key = `${valueInEth} ETH`;
                    transactionCounts[key] = transactionCounts[key] ? transactionCounts[key] + 1 : 1;
                }
            });

            if (response.data.result.length < 10000) {
                keepFetching = false;
            } else {
                const lastTransaction = response.data.result[response.data.result.length - 1];
                startBlock = parseInt(lastTransaction.blockNumber) + 1;
            }
        }
        return NextResponse.json({ transactionCounts }, { status: 200 });
    } catch (error: any) {
        console.error('Etherscan API request failed:', error);
        return NextResponse.json({ error: error.toString() }, { status: 500 });
    }

}
