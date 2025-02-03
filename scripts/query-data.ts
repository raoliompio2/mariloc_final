import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tcdkfikfbnvelvrigdki.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZGtmaWtmYm52ZWx2cmlnZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDMxMjIsImV4cCI6MjA1MzkxOTEyMn0.6zk97HUNYourGQjA70l2bIz06g43Ooy3qsZ-Iry9S1M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function queryData() {
  // Query products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
  
  if (productsError) {
    console.error('Error fetching products:', productsError)
  } else {
    console.log('Products:', JSON.stringify(products, null, 2))
  }
}

queryData()
