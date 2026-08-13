import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const consumptionsRouter = new Hono<{ Bindings: Bindings }>();

const getSupabaseClient = (c: any) => {
  const url = (c.env.SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  const key = (c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_KEY || '').trim().replace(/^["']|["']$/g, '');
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// GET /consumptions/:buildingId — fetch all daily_consumptions for a building
consumptionsRouter.get('/consumptions/:buildingId', async (c) => {
  const buildingId = parseInt(c.req.param('buildingId'), 10);
  if (isNaN(buildingId)) {
    return c.json({ ok: false, message: 'Invalid building ID' }, 400);
  }

  const supabase = getSupabaseClient(c);
  const { data, error } = await supabase
    .from('daily_consumptions')
    .select()
    .eq('building_id', buildingId)
    .order('log_date', { ascending: true });

  if (error) {
    return c.json({ ok: false, message: 'Error fetching consumptions', error }, 500);
  }

  return c.json({ ok: true, data });
});

// POST /consumptions — upsert a single day's consumption
// Body: { building_id, log_date (YYYY-MM-DD), cubic_meters, is_manual_entry? }
consumptionsRouter.post('/consumptions', async (c) => {
  const body = await c.req.json();

  if (!body.building_id || !body.log_date || body.cubic_meters === undefined) {
    return c.json({ ok: false, message: 'building_id, log_date, and cubic_meters are required' }, 400);
  }

  const supabase = getSupabaseClient(c);

  // Check if a record already exists for this building + date
  const { data: existing } = await supabase
    .from('daily_consumptions')
    .select('id')
    .eq('building_id', body.building_id)
    .eq('log_date', body.log_date)
    .maybeSingle();

  let result;

  if (existing) {
    // Update existing record
    result = await supabase
      .from('daily_consumptions')
      .update({
        cubic_meters: body.cubic_meters,
        is_manual_entry: body.is_manual_entry ?? true,
      })
      .eq('id', existing.id)
      .select();
  } else {
    // Insert new record
    result = await supabase
      .from('daily_consumptions')
      .insert([{
        building_id: body.building_id,
        log_date: body.log_date,
        cubic_meters: body.cubic_meters,
        is_manual_entry: body.is_manual_entry ?? true,
      }])
      .select();
  }

  if (result.error) {
    return c.json({ ok: false, message: 'Error saving consumption', error: result.error }, 500);
  }

  return c.json({ ok: true, data: result.data });
});

// DELETE /consumptions/:buildingId/:date — delete a single day's record
consumptionsRouter.delete('/consumptions/:buildingId/:date', async (c) => {
  const buildingId = parseInt(c.req.param('buildingId'), 10);
  const date = c.req.param('date'); // YYYY-MM-DD

  if (isNaN(buildingId)) {
    return c.json({ ok: false, message: 'Invalid building ID' }, 400);
  }

  const supabase = getSupabaseClient(c);
  const { data, error } = await supabase
    .from('daily_consumptions')
    .delete()
    .eq('building_id', buildingId)
    .eq('log_date', date);

  if (error) {
    return c.json({ ok: false, message: 'Error deleting consumption', error }, 500);
  }

  return c.json({ ok: true, message: 'Record deleted', data });
});

// DELETE /consumptions/:buildingId/month/:year/:month — delete all records for a month
consumptionsRouter.delete('/consumptions/:buildingId/month/:year/:month', async (c) => {
  const buildingId = parseInt(c.req.param('buildingId'), 10);
  const year = parseInt(c.req.param('year'), 10);
  const month = parseInt(c.req.param('month'), 10); // 1-12

  if (isNaN(buildingId) || isNaN(year) || isNaN(month)) {
    return c.json({ ok: false, message: 'Invalid parameters' }, 400);
  }

  // Build date range for the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // last day of month
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const supabase = getSupabaseClient(c);
  const { data, error } = await supabase
    .from('daily_consumptions')
    .delete()
    .eq('building_id', buildingId)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (error) {
    return c.json({ ok: false, message: 'Error deleting month records', error }, 500);
  }

  return c.json({ ok: true, message: `Deleted records for ${year}-${month}`, data });
});

export default consumptionsRouter;
