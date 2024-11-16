/**
 * For hackathon purposes this is a simplified demo of how to interact with the PaymentProcessor contract. 
 * Later on this will be done with AA and Proxy accounts like the rest of the ChatterPay flow
 */

import { ethers } from 'ethers';

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

interface CreateOrderParams {
    signer: ethers.Signer;       // Ethereum signer
    order_id: string;            // Unique order identifier
    token_address: string;       // ERC20 token address
    amount: string | number;     // Amount in token units
}

interface PayOrderParams {
    signer: ethers.Signer;       // Ethereum signer
    order_id: string;            // Order ID to pay
}

/**
 * Creates a new payment order through the PaymentProcessor
 */
export async function createOrder({
    signer,
    order_id,
    token_address,
    amount
}: CreateOrderParams): Promise<ethers.ContractTransaction> {
    // Convert amount to string if it isn't already
    const amountString = String(amount);

    // Validate the amount string
    if (!amountString.match(/^\d*\.?\d*$/)) {
        throw new Error('Invalid amount format - must be a valid number');
    }

    // Create contract instance with signer
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        signer
    );

    // Convert amount to wei
    const amountWei = ethers.utils.parseUnits(amountString, 18);
    const orderId = createOrderId(order_id);

    // Execute the transaction
    const tx = await contract.createPaymentOrder(
        orderId,
        token_address,
        amountWei
    );

    return tx;
}

/**
 * Pays an existing order through the PaymentProcessor
 */
export async function payOrder({
    signer,
    order_id
}: PayOrderParams): Promise<ethers.ContractTransaction> {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        signer
    );

    const orderId = createOrderId(order_id);
    const tx = await contract.payOrder(orderId);

    return tx;
}

/**
 * Helper function to calculate the fee for a given amount
 */
export async function calculateFee(
    provider: ethers.providers.Provider,
    amount: string | number
): Promise<string> {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        provider
    );
    
    // Convert amount to string if it isn't already
    const amountString = String(amount);
    
    try {
        const amountWei = ethers.utils.parseUnits(amountString, 18);
        const feeWei = await contract.calculateFee(amountWei);
        
        return ethers.utils.formatUnits(feeWei, 18);
    } catch (error) {
        throw new Error(`Error calculating fee: ${error}`);
    }
}

/**
 * Get order details
 */
export async function getOrder(
    provider: ethers.providers.Provider,
    order_id: string
): Promise<PaymentOrder> {
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        provider
    );

    const orderId = createOrderId(order_id);
    const [token, amount, paid, payer, fee] = await contract.getOrder(orderId);

    return {
        token,
        amount: ethers.utils.formatUnits(amount, 18),
        paid,
        payer,
        fee: ethers.utils.formatUnits(fee, 18)
    };
}