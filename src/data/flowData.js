import emergency from './flows/emergency.json';
import medicine from './flows/medicine.json';
import hospital from './flows/hospital.json';
import { normalizeFlows } from '../lib/flowModel';

export const protocols = { emergency, medicine, hospital };
export default normalizeFlows(protocols);
