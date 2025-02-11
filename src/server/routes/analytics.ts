import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/quotes', async (request) => {
    const schema = z.object({
      days: z.coerce.number().min(1).max(365).default(30),
    });

    const { days } = schema.parse(request.query);

    // Calcula as datas para o intervalo
    const intervals = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Busca orçamentos recebidos por dia
    const quotesResult = await db.execute(sql`
      WITH RECURSIVE dates AS (
        SELECT date_trunc('day', now() - interval '${days} days') as date
        UNION ALL
        SELECT date + interval '1 day'
        FROM dates
        WHERE date < date_trunc('day', now())
      )
      SELECT 
        dates.date::date as date,
        COUNT(quotes.id) as count
      FROM dates
      LEFT JOIN quotes ON date_trunc('day', quotes.created_at) = dates.date
      GROUP BY dates.date
      ORDER BY dates.date
    `);

    // Busca aluguéis completados por dia
    const rentalsResult = await db.execute(sql`
      WITH RECURSIVE dates AS (
        SELECT date_trunc('day', now() - interval '${days} days') as date
        UNION ALL
        SELECT date + interval '1 day'
        FROM dates
        WHERE date < date_trunc('day', now())
      )
      SELECT 
        dates.date::date as date,
        COUNT(rentals.id) as count,
        COALESCE(SUM(quotes.response_price), 0) as total_value
      FROM dates
      LEFT JOIN rentals ON date_trunc('day', rentals.created_at) = dates.date
      LEFT JOIN quotes ON quotes.id = rentals.quote_id
      GROUP BY dates.date
      ORDER BY dates.date
    `);

    // Processa os resultados
    const receivedQuotes = intervals.map(date => {
      const entry = quotesResult.find((r: any) => r.date.split('T')[0] === date);
      return entry ? Number(entry.count) : 0;
    });

    const completedRentals = intervals.map(date => {
      const entry = rentalsResult.find((r: any) => r.date.split('T')[0] === date);
      return entry ? Number(entry.count) : 0;
    });

    const rentalValues = intervals.map(date => {
      const entry = rentalsResult.find((r: any) => r.date.split('T')[0] === date);
      return entry ? Number(entry.total_value) : 0;
    });

    // Formata as labels para o gráfico (ex: "10/02")
    const labels = intervals.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}`;
    });

    return {
      labels,
      receivedQuotes,
      completedRentals,
      rentalValues,
    };
  });
}
