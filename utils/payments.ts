import { ethers } from 'ethers';
import axios from 'axios';

const PAYMENT_PROCESSOR_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address
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
    amount: string
): string {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI
    );

    // Convert amount to wei
    const amountWei = ethers.utils.parseUnits(amount, 18);

    return contract.interface.encodeFunctionData(
        'createPaymentOrder',
        [orderId, tokenAddress, amountWei]
    );
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
    amount: string;            // Amount in token units
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
    amount,
    chain_id
}: CreateOrderParams): Promise<{ transactionHash: string }> {
    const orderId = createOrderId(order_id);
    const calldata = createPaymentOrderCalldata(orderId, token_address, amount);

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
 * Pays an existing order through the PaymentProcessor
 * Note: Requires prior ERC20 approval for the payment amount
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
 * This is a view function that doesn't require a transaction
 */
export function calculateFee(amount: string): string {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI
    );
    
    const amountWei = ethers.utils.parseUnits(amount, 18);
    const feeWei = contract.interface.encodeFunctionData(
        'calculateFee',
        [amountWei]
    );
    
    return ethers.utils.formatUnits(feeWei, 18);
}

/**
 * Example usage:
 * 
 * // Create a new order
 * const orderResult = await createOrder({
 *     channel_user_id: "1234567890",  // Admin's phone
 *     order_id: "order123",           // Unique order ID
 *     token_address: "0xtoken...",    // ERC20 token address
 *     amount: "100",                  // 100 tokens
 * });
 * 
 * // Pay an existing order
 * const payResult = await payOrder({
 *     channel_user_id: "9876543210",  // User's phone
 *     order_id: "order123",           // Same order ID
 * });
 */