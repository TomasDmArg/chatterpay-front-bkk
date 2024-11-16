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
    console.log(`Creating order ID for unique ID: ${uniqueId}`);
    const orderId = ethers.utils.id(uniqueId);
    console.log(`Generated order ID: ${orderId}`);
    return orderId;
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
    console.log(`Creating payment order with params:`, {
        signer,
        order_id,
        token_address,
        amount
    });

    // Convert amount to string if it isn't already
    const amountString = String(amount);

    // Validate the amount string
    if (!amountString.match(/^\d*\.?\d*$/)) {
        console.error(`Invalid amount format: ${amountString}`);
        throw new Error('Invalid amount format - must be a valid number');
    }

    // Create contract instance with signer
    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        signer,
    );

    // Convert amount to wei
    const amountWei = ethers.utils.parseUnits(amountString, 18);
    const orderId = createOrderId(order_id);

    console.log(`Converted amount to wei: ${amountWei}`);
    console.log(`Calling createPaymentOrder with params:`, {
        orderId,
        token_address,
        amountWei
    });

    // Execute the transaction
    const tx = await contract.createPaymentOrder(
        orderId,
        token_address,
        amountWei,
        {
            gasLimit: 300000 // Adjust based on your needs
        }
    );

    console.log(`Transaction sent:`, tx);

    return tx;
}

/**
 * Pays an existing order through the PaymentProcessor
 */
export async function payOrder({
    signer,
    order_id
}: PayOrderParams): Promise<ethers.ContractTransaction> {
    console.log(`Paying order with params:`, {
        signer, 
        order_id
    });

    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        signer
    );

    const orderId = createOrderId(order_id);

    console.log(`Calling payOrder with orderId: ${orderId}`);

    const tx = await contract.payOrder(orderId);

    console.log(`Transaction sent:`, tx);

    return tx;
}

/**
 * Helper function to calculate the fee for a given amount
 */
export async function calculateFee(
    provider: ethers.providers.Provider,
    amount: string | number
): Promise<string> {
    console.log(`Calculating fee for amount: ${amount}`);

    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        provider
    );
    
    // Convert amount to string if it isn't already
    const amountString = String(amount);
    
    try {
        const amountWei = ethers.utils.parseUnits(amountString, 18);
        console.log(`Converted amount to wei: ${amountWei}`);

        console.log(`Calling calculateFee with amountWei: ${amountWei}`);
        const feeWei = await contract.calculateFee(amountWei);
        
        const feeEther = ethers.utils.formatUnits(feeWei, 18);
        console.log(`Calculated fee: ${feeEther} ether`);

        return feeEther;
    } catch (error) {
        console.error(`Error calculating fee:`, error);
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
    console.log(`Getting order details for order ID: ${order_id}`);

    const contract = new ethers.Contract(
        PAYMENT_PROCESSOR_ADDRESS,
        PAYMENT_PROCESSOR_ABI,
        provider
    );

    const orderId = createOrderId(order_id);
    console.log(`Calling getOrder with orderId: ${orderId}`);
    const [token, amount, paid, payer, fee] = await contract.getOrder(orderId);

    console.log(`Received order details:`, {
        token,
        amount: ethers.utils.formatUnits(amount, 18),
        paid,
        payer,
        fee: ethers.utils.formatUnits(fee, 18)
    });

    return {
        token,
        amount: ethers.utils.formatUnits(amount, 18),
        paid,
        payer,
        fee: ethers.utils.formatUnits(fee, 18)
    };
}