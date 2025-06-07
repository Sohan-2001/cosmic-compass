
import { config } from 'dotenv';
config();

// Remove yearly-outlook as its functionality is merged into event-prediction (now yearly-predictions)
// import '@/ai/flows/yearly-outlook.ts'; 
import '@/ai/flows/palm-reading.ts';
import '@/ai/flows/event-prediction.ts'; // This now handles yearly predictions
import '@/ai/flows/monthly-forecast.ts';
import '@/ai/flows/translate-text-flow.ts';
