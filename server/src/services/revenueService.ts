import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { IRevenueService } from "./interfaces/IRevenueService";
import { IRevenueRepository } from '../repositories/interfaces/IRevenueRepository';
import PDFDocument from "pdfkit";

@injectable()
export class RevenueService implements IRevenueService {
  constructor(
    @inject(TYPES.RevenueRepository)
    private revenueRepository:IRevenueRepository
  ){}
  async getRevenueData(period: string): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();

    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === "all") {
      startDate.setFullYear(2025, 3, 1);
    }

    const totalRevenue = await this.revenueRepository.getTotalRevenue(
      startDate,
      endDate
    );
    const monthlyRevenue = await this.revenueRepository.getMonthlyRevenue(
      startDate,
      endDate
    );
    const planRevenue = await this.revenueRepository.getPlanRevenue(
      startDate,
      endDate
    );
    const transactionTypes = await this.revenueRepository.getTransactionTypes(
      startDate,
      endDate
    );
    const recentTransactions = await this.revenueRepository.getRecentTransactions();

    return {
      totalRevenue,
      monthlyRevenue,
      planRevenue,
      transactionTypes,
      recentTransactions,
    };
  }

  private formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  async generateRevenueReport(period: string): Promise<Buffer> {
    const revenueData = await this.getRevenueData(period);

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (buffer) => buffers.push(buffer));

    doc
      .fontSize(20)
      .text(`Revenue Report - ${this.getPeriodText(period)}`, {
        align: "center",
      });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleDateString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    doc
      .fontSize(16)
      .text(`Total Revenue: ${this.formatCurrency(revenueData.totalRevenue)}`);
    doc.moveDown(2);

    doc.fontSize(16).text("Revenue by Plan");
    doc.moveDown();

    this.drawTable(
      doc,
      {
        headers: ["Plan Name", "Amount", "% of Total"],
        rows: revenueData.planRevenue.map((plan: any) => [
          plan.planName,
          this.formatCurrency(plan.amount),
          `${((plan.amount / revenueData.totalRevenue) * 100).toFixed(1)}%`,
        ]),
      },
      50,
      doc.y,
      [200, 150, 100]
    );

    doc.moveDown(2);

    doc.fontSize(16).text("Transaction Types");
    doc.moveDown();

    this.drawTable(
      doc,
      {
        headers: ["Type", "Count", "Amount", "% of Total"],
        rows: revenueData.transactionTypes.map((type: any) => [
          type.type,
          type.count.toString(),
          this.formatCurrency(type.amount),
          `${((type.amount / revenueData.totalRevenue) * 100).toFixed(1)}%`,
        ]),
      },
      50,
      doc.y,
      [100, 100, 150, 100]
    );

    doc.moveDown(2);

    doc.fontSize(16).text("Monthly Revenue");
    doc.moveDown();

    this.drawTable(
      doc,
      {
        headers: ["Month", "Amount"],
        rows: revenueData.monthlyRevenue.map((item: any) => [
          item.month,
          this.formatCurrency(item.amount),
        ]),
      },
      50,
      doc.y,
      [200, 150]
    );

    doc.moveDown(2);

    doc.fontSize(16).text("Recent Transactions");
    doc.moveDown();

    this.drawTable(
      doc,
      {
        headers: ["Host", "Plan", "Type", "Date", "Amount"],
        rows: revenueData.recentTransactions
          .slice(0, 10)
          .map((tx: any) => [
            tx.hostName,
            tx.planName,
            tx.type,
            new Date(tx.date).toLocaleDateString(),
            this.formatCurrency(tx.amount),
          ]),
      },
      50,
      doc.y,
      [100, 100, 80, 100, 100]
    );

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });
  }

  private getPeriodText(period: string): string {
    switch (period) {
      case "month":
        return "Last Month";
      case "year":
        return "Last Year";
      case "all":
        return "All Time (Since April 2025)";
      default:
        return "Custom Period";
    }
  }

  private drawTable(
    doc: PDFKit.PDFDocument,
    table: { headers: string[]; rows: string[][] },
    startX: number,
    startY: number,
    colWidths: number[]
  ): number {
    const rowHeight = 20;
    let y = startY;
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    doc.font("Helvetica-Bold");
    for (let i = 0; i < table.headers.length; i++) {
      doc.text(
        table.headers[i],
        startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y
      );
    }
    y += rowHeight;

    doc.font("Helvetica");
    for (const row of table.rows) {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        y = doc.page.margins.top;

        doc.font("Helvetica-Bold");
        for (let i = 0; i < table.headers.length; i++) {
          doc.text(
            table.headers[i],
            startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y
          );
        }
        y += rowHeight;
        doc.font("Helvetica");
      }

      for (let i = 0; i < row.length; i++) {
        doc.text(
          row[i],
          startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y
        );
      }
      y += rowHeight;
    }

    return y;
  }
}

//export default new RevenueService();
