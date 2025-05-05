import 'reflect-metadata';
import { injectable,inject } from 'inversify';
import TYPES from '../config/di/types';
import { IHostRevenueService } from "./interfaces/IHostRevenueService";
import { IHostRevenueRepository } from '../repositories/interfaces/IHostRevenueRepository';
import PDFDocument from "pdfkit";

@injectable()
export class HostRevenueService implements IHostRevenueService {
  
  constructor(
    @inject(TYPES.HostRevenueRepository)
    private hostRevenueRepository: IHostRevenueRepository
  ){}
  async getHostRevenueData(hostId: string, period: string): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();

    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (period === "all") {
      
      startDate.setFullYear(2025, 3, 1);
    }

    const totalRevenue = await this.hostRevenueRepository.getHostTotalRevenue(
      hostId,
      startDate,
      endDate
    );
    const monthlyRevenue = await this.hostRevenueRepository.getHostMonthlyRevenue(
      hostId,
      startDate,
      endDate
    );
    const eventRevenue = await this.hostRevenueRepository.getEventRevenue(
      hostId,
      startDate,
      endDate
    );
    const paymentMethods = await this.hostRevenueRepository.getPaymentMethodBreakdown(
      hostId,
      startDate,
      endDate
    );
    const cancellations = await this.hostRevenueRepository.getCancellationAnalytics(
      hostId,
      startDate,
      endDate
    );
    const ticketTypes = await this.hostRevenueRepository.getTicketTypeBreakdown(
      hostId,
      startDate,
      endDate
    );

    return {
      totalRevenue,
      monthlyRevenue,
      eventRevenue,
      paymentMethods,
      cancellations,
      ticketTypes,
    };
  }

  async generateHostRevenueReport(hostId: string, period: string): Promise<Buffer> {
    const revenueData = await this.getHostRevenueData(hostId, period);
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    doc.fontSize(20)
       .text(`Host Revenue Report - ${this.getPeriodText(period)}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12)
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(16)
       .text(`Total Revenue: ${this.formatCurrency(revenueData.totalRevenue)}`);
    doc.moveDown(2);

    doc.fontSize(16).text("Revenue by Event");
    doc.moveDown();
    this.drawTable(
      doc,
      {
        headers: ["Event Name", "Amount", "Tickets Sold"],
        rows: revenueData.eventRevenue.map((e: any) => [
          e.eventName,
          this.formatCurrency(e.amount),
          e.ticketsSold.toString(),
        ])
      },
      50,
      doc.y,
      [200, 150, 100]
    );
    doc.moveDown(2);

    doc.fontSize(16).text("Payment Methods");
    doc.moveDown();
    this.drawTable(
      doc,
      {
        headers: ["Method", "Count", "Amount", "% of Total"],
        rows: revenueData.paymentMethods.map((m: any) => [
          m.type,
          m.count.toString(),
          this.formatCurrency(m.amount),
          `${((m.amount / revenueData.totalRevenue) * 100).toFixed(1)}%`,
        ])
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
        rows: revenueData.monthlyRevenue.map((m: any) => [
          m.month,
          this.formatCurrency(m.amount),
        ])
      },
      50,
      doc.y,
      [200, 150]
    );
    doc.moveDown(2);

    doc.fontSize(16).text("Ticket Type Breakdown");
    doc.moveDown();
    this.drawTable(
      doc,
      {
        headers: ["Ticket Type", "Quantity", "Revenue"],
        rows: revenueData.ticketTypes.map((t: any) => [
          t.ticketType,
          t.quantity.toString(),
          this.formatCurrency(t.revenue),
        ])
      },
      50,
      doc.y,
      [200, 100, 150]
    );
    doc.moveDown(2);

    if (revenueData.cancellations.length > 0) {
      doc.fontSize(16).text("Cancellation Analytics");
      doc.moveDown();
      this.drawTable(
        doc,
        {
          headers: ["Cancelled By", "Count", "Amount"],
          rows: revenueData.cancellations.map((c: any) => [
            c.cancelledBy,
            c.count.toString(),
            this.formatCurrency(c.amount),
          ])
        },
        50,
        doc.y,
        [150, 100, 150]
      );
      doc.moveDown(2);
    }

    doc.end();
    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });
  }

  
  private formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  
  private getPeriodText(period: string): string {
    switch (period) {
      case "month": return "Last Month";
      case "year":  return "Last Year";
      case "all":   return "All Time (Since April 2025)";
      default:      return "Custom Period";
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
    table.headers.forEach((hdr, i) => {
      doc.text(hdr, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
    });
    y += rowHeight;

    doc.font("Helvetica");
    for (const row of table.rows) {
     
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        y = doc.page.margins.top;
       
        doc.font("Helvetica-Bold");
        table.headers.forEach((hdr, i) => {
          doc.text(hdr, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        y += rowHeight;
        doc.font("Helvetica");
      }

     
      row.forEach((cell, i) => {
        doc.text(cell, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      y += rowHeight;
    }

    return y;
  }
}

//export default new HostRevenueService();
