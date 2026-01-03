import mongoose from "mongoose";
import { FormuleCreditInterface } from "../interface/FormuleCreditInterface";
import { FormuleCreditSchema } from "../schema/FormuleCreditSchema";


export const FormuleCreditModel =
  mongoose.models.Formule ||
  mongoose.model<FormuleCreditInterface>("Formule", FormuleCreditSchema);
