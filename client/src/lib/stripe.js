import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "pk_test_51S0mIfKtPskVJRCD6AF6nlp96RLACtFuc1HCrhAUuESnRdfvAmxNn58tu1VdsnMJZxILWb0mobZvwgwExGwfc5a2009Ui2jnJf");
  }
  return stripePromise;
};
