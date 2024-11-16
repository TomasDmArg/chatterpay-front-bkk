import { ethers } from 'ethers';
import axios from 'axios';

const PAYMENT_PROCESSOR_ADDRESS = '0x3B4Df2bf0A5f7036e19f6dE66dF79e2a8b7Bd1eD';
const PAYMENT_PROCESSOR_ABI = [
    "function createPaymentOrder(bytes32 orderId, address token, uint256 amount) external",
    "function payOrder(bytes32 orderId) external",
    "function getOrder(bytes32 orderId) external view returns (address token, uint256 amount, bool paid, address payer, uint256 fee)",
    "function calculateFee(uint256 amount) public pure returns (uint256)"
];

interface PaymentOrder {
    token: string;
    amount: string;
    paid: boolean;
    payer: string;
    fee: string;
}

/**
 * Creates an order ID from a unique identifier
 */
export function createOrderId(uniqueId: string): string {
    return ethers.utils.id(uniqueId);
}

/**
 * Formats the calldata for creating a payment order
 */
export function createPaymentOrderCalldata(
    orderId: string,
    tokenAddress: string,
    amount: string | number
): string {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI
    );

    // Convert amount to string if it isn't already
    const amountString = String(amount);
    
    // Validate the amount string
    if (!amountString.match(/^\d*\.?\d*$/)) {
        throw new Error('Invalid amount format - must be a valid number');
    }

    // Convert amount to wei
    try {
        const amountWei = ethers.utils.parseUnits(amountString, 18);
        
        return contract.interface.encodeFunctionData(
            'createPaymentOrder',
            [orderId, tokenAddress, amountWei]
        );
    } catch (error) {
        throw new Error(`Error parsing amount: ${error}`);
    }
}

/**
 * Formats the calldata for paying an order
 */
export function createPayOrderCalldata(orderId: string): string {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI
    );

    return contract.interface.encodeFunctionData(
        'payOrder',
        [orderId]
    );
}

interface CreateOrderParams {
    channel_user_id: string;   // Admin's phone number
    order_id: string;          // Unique order identifier
    token_address: string;     // ERC20 token address
    amount: string | number;   // Amount in token units (can be string or number)
    chain_id?: string;         // Optional chain ID
}

interface PayOrderParams {
    channel_user_id: string;   // User's phone number
    order_id: string;          // Order ID to pay
    chain_id?: string;         // Optional chain ID
}

/**
 * Creates a new payment order through the PaymentProcessor
 */
export async function createOrder({
    channel_user_id,
    order_id,
    token_address,
    amount
}: CreateOrderParams): Promise<{ transactionHash: string }> {
    // Convert amount to string if it isn't already
    const amountString = String(amount);

    const orderId = createOrderId(order_id);
    const calldata = createPaymentOrderCalldata(orderId, token_address, amountString);


    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/execute_contract_call/`, {
        channel_user_id,
        target_contract: PAYMENT_PROCESSOR_ADDRESS,
        calldata,
        value: "0",
        chain_id: 137
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.FRONTEND_TOKEN}`
        }
    });

    if (response.data.error) {
        throw new Error(response.data.error);
    }

    return response.data.data;
}

/**
 * Pays an existing order through the PaymentProcessor
 */
export async function payOrder({
    channel_user_id,
    order_id,
    chain_id
}: PayOrderParams): Promise<{ transactionHash: string }> {
    const orderId = createOrderId(order_id);
    const calldata = createPayOrderCalldata(orderId);

    const response = await axios.post('/api/contract-call', {
        channel_user_id,
        target_contract: PAYMENT_PROCESSOR_ADDRESS,
        calldata,
        chain_id
    });

    if (response.data.error) {
        throw new Error(response.data.error);
    }

    return response.data.data;
}

/**
 * Helper function to calculate the fee for a given amount
 */
export function calculateFee(amount: string | number): string {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI
    );
    
    // Convert amount to string if it isn't already
    const amountString = String(amount);
    
    try {
        const amountWei = ethers.utils.parseUnits(amountString, 18);
        const feeWei = contract.interface.encodeFunctionData(
            'calculateFee',
            [amountWei]
        );
        
        return ethers.utils.formatUnits(feeWei, 18);
    } catch (error) {
        throw new Error(`Error calculating fee: ${error}`);
    }
}