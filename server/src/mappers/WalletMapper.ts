import { IWallet, ITransaction } from "../models/wallet";
import { 
  WalletResponseDto, 
  TransactionDto, 
  PaginatedWalletResponseDto, 
  PaginationDto,
  UpdateWalletBalanceDto 
} from "../dtos/wallet/WalletDTO";


export function toTransactionDto(transaction: ITransaction): TransactionDto {
  return {
    id: transaction._id?.toString(),
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    paymentId: transaction.paymentId,
    date: transaction.date,
  };
}

export function toWalletResponseDto(wallet: IWallet): WalletResponseDto {
  return {
    id: wallet._id.toString(),
    userId: wallet.user.toString(),
    balance: wallet.balance,
    transactions: wallet.transactions.map(transaction => toTransactionDto(transaction)),
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}

export function toPaginatedWalletResponseDto(
  result: { wallet: IWallet | null, pagination: any }
): PaginatedWalletResponseDto {
  return {
    wallet: result.wallet ? toWalletResponseDto(result.wallet) : null,
    pagination: {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages,
    },
  };
}


export function fromUpdateBalanceDtoToModel(dto: UpdateWalletBalanceDto) {
  return {
    userId: dto.userId,
    amount: dto.amount,
    paymentId: dto.paymentId,
    description: dto.description || (dto.type === "credit" ? "Wallet recharge" : "Wallet deduction"),
  };
}