import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { loadStripe } from "@stripe/stripe-js";
import SVG from "react-inlinesvg";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  theme,
  BaseIconButton,
  LoadingSpinner,
  BaseTextButton,
} from "@gliff-ai/style";

import {
  addAddons,
  getAddonPrices,
  getInvoices,
  getLimits,
  getPlan,
  getPayment,
  createCheckoutSession,
  cancelPlan,
} from "@/services/billing";

import type {
  AddonPrices,
  Invoice,
  Limits,
  Plan,
  Payment,
} from "@/services/billing";

import { imgSrc } from "@/imgSrc";
import { useInput } from "@/hooks/use-input";
import { SubmitButton, GliffCard } from "@/components";

import { useAuth } from "@/hooks/use-auth";
import { Addon } from "@/services/billing/interfaces";

const STRIPE_KEY = import.meta.env.VITE_STRIPE_KEY;

const stripePromise = loadStripe(STRIPE_KEY);

type FormState = {
  [key in "user" | "project" | "collaborator"]: {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    reset: () => void;
    bind: { value: string; onChange: (event: any) => void };
  };
};

const useStyle = makeStyles(() => ({
  baseTable: {
    width: "100%",
    "& th, & td": {
      textAlign: "left",
    },
    "& svg": {
      width: "30px",
    },
  },
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    "& > h2": {
      lineHeight: "45px",
      "& > button": {
        margin: 0,
        float: "right",
      },
    },
  },
}));

const toTitleCase = (s: string): string =>
  `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

export function Billing(): JSX.Element {
  const classes = useStyle();
  const auth = useAuth();
  const [limits, setLimits] = useState<Limits | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [payment, setPayment] = useState<Payment | null | false>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null | false>(null);

  const [addonPrices, setAddonPrices] = useState<AddonPrices | null>(null);
  const [addonFormLoading, setAddonFormLoading] = useState(false);
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);

  const form = {
    user: useInput("0"),
    project: useInput("0"),
    collaborator: useInput("0"),
    loading: false,
  } as FormState;

  const plansMap = {
    COMMUNITY: { icon: imgSrc("essential-plan"), name: "Essential" },
    PRO: { icon: imgSrc("small-team-plan"), name: "Small Team" },
    TEAM: { icon: imgSrc("growing-team-plan"), name: "Growing Team" },
    CUSTOM: { icon: imgSrc("growing-team-plan"), name: "Custom Plan" },
  } as const;

  const addonTypes = ["user", "project", "collaborator"] as const;

  const addPaymentButton = (): JSX.Element => {
    const doCheckout = async () => {
      const stripe = await stripePromise;
      try {
        const session = await createCheckoutSession();

        if (!session || !stripe) {
          return;
        }

        const { id: sessionId } = session;

        // When the customer clicks on the button, redirect them to Checkout.
        const result = await stripe.redirectToCheckout({
          sessionId,
        });

        if (result.error) {
          console.error(result.error);
        }
      } catch (error) {
        console.error(error);
      }
    };

    return <BaseTextButton onClick={doCheckout} text="Add Payment Method" />;
  };

  useEffect(() => {
    if (auth?.user) {
      void getLimits().then(setLimits);
      void getPlan().then((p) => {
        if (p) {
          setPlan(p);
          // We don't want to show the invoice for the free trial
          void getInvoices().then((i: Invoice[]) => {
            if (p.is_trial) {
              setInvoices(false);
            } else {
              setInvoices(i);
            }
          });
          void getPayment().then((p) => setPayment(p ?? false));
        }
      });
    }
  }, [addonFormLoading, auth]);

  const usageElement = (
    <GliffCard
      title="Plan Usage"
      el={
        !limits ? (
          <LoadingSpinner />
        ) : (
          <table className={classes.baseTable}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {addonTypes.map((a) => (
                <tr key={a}>
                  <td>{`${toTitleCase(a)}s`}</td>
                  <td>
                    {limits[`${a}s`]} of {limits[`${a}s_limit`] ?? "Unlimited"}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Storage</td>
                <td>
                  {limits.storage / 1000}Gb used
                  <br />
                  Your current plan includes{" "}
                  {limits.storage_included_limit / 1000}
                  GB
                </td>
              </tr>

              {!payment ? null : (
                <>
                  <tr>
                    <td colSpan={2}>
                      <br />
                      <BaseTextButton
                        text={"Change Plan"}
                        style={{ margin: "0 auto", display: "block" }}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2}>
                      <br />
                      <BaseTextButton
                        text={"Purchase Addons"}
                        style={{ margin: "0 auto", display: "block" }}
                        onClick={() => {
                          setAddonDialogOpen(true);
                          void getAddonPrices().then(setAddonPrices);
                        }}
                      />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        )
      }
      action={
        !plan?.is_custom
          ? {
              tooltip: "Add Addons",
              icon: imgSrc("add"),
              onClick: () => {
                setAddonDialogOpen(true);
                void getAddonPrices().then(setAddonPrices);
              },
            }
          : undefined
      }
    />
  );

  const cancelPlanButton = (
    <BaseTextButton
      text={"Cancel Plan"}
      onClick={async () => {
        await cancelPlan();
        const p = await getPlan();
        if (p) {
          setPlan(p);
        }
      }}
      style={{ margin: "0 auto", display: "block" }}
    />
  );

  const paymentDetails = (p: Plan) => (
    <>
      {payment ? (
        <>
          <br />
          You will be charged and moved on to the {
            plansMap[p.tier_name].name
          }{" "}
          plan at the end of your trial.
          <br />
          <br />
          {cancelPlanButton}
        </>
      ) : (
        <>
          After this date you will be downgraded to the free plan.
          <br />
          <br />
          To continue on the {plansMap[p.tier_name].name} plan, please add
          payment details.
        </>
      )}
    </>
  );

  const planDescription = (p: Plan) => (
    <>
      <Grid item xs={p.is_trial || p.is_custom ? 12 : 4}>
        <div
          style={{
            width: "100%",
            padding: p.is_trial ? "25px" : "75px",
            textAlign: "center",
          }}
        >
          <SVG
            src={
              p.is_custom ? plansMap.CUSTOM.icon : plansMap[p.tier_name].icon
            }
            style={{ width: "100px", height: "100px", margin: "auto" }}
          />
        </div>

        <div
          style={{
            width: "100%",
            padding: "10px",
            textAlign: "center",
          }}
        >
          {p.is_trial ? (
            <>
              You are on the free trial for the{" "}
              <strong>{plansMap[p.tier_name].name}</strong> plan.
              <br />
              Your trial ends on:{" "}
              {new Date(p.trial_end * 1000).toLocaleDateString()}
              <br />
              {paymentDetails(p)}
            </>
          ) : (
            <>
              Your current plan is{" "}
              <strong>
                {p.is_custom ? p.tier_name : plansMap[p.tier_name].name}
              </strong>{" "}
              {!p.is_custom ? (
                <>
                  {" "}
                  with{" "}
                  <strong>
                    {Object.values(p.addons).filter((a) => !!a).length}
                  </strong>{" "}
                  addons
                  <br />
                  The current period ends on:{" "}
                  {new Date(p.current_period_end * 1000).toLocaleDateString()}
                  <br />
                  <br />
                  {cancelPlanButton}
                </>
              ) : (
                ""
              )}
            </>
          )}
        </div>
      </Grid>

      {!p.is_trial && !p.is_custom ? (
        <Grid item xs={5}>
          <table className={classes.baseTable}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{plansMap[p.tier_name].name}</td>
                <td>£{p.base_price / 100}</td>
              </tr>

              {Object.entries(p.addons)
                .filter(([, a]) => !!a)
                .map(([key, addon]: [string, Addon]) => (
                  <tr key={key}>
                    <td>
                      {" "}
                      {addon.quantity} x {addon.name} @ £
                      {addon.price_per_unit / 100} each
                    </td>
                    <td>£{addon.quantity * (addon.price_per_unit / 100)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Grid>
      ) : (
        <></>
      )}
    </>
  );

  let planElement: JSX.Element;
  if (!plan) {
    planElement = <GliffCard title="Plan" el={<LoadingSpinner />} />;
  } else {
    planElement = (
      <GliffCard
        title="Plan"
        el={
          <Grid container spacing={3}>
            {planDescription(plan)}
          </Grid>
        }
      />
    );
  }

  let paymentElement = (
    <GliffCard title="Payment Details" el={<LoadingSpinner />} />
  );

  if (payment !== null && !plan?.is_custom) {
    paymentElement = (
      <GliffCard
        title="Payment Details"
        el={
          payment ? (
            <>
              Card Number: {payment.number}
              <br />
              Card Expiry: {payment.expiry}
              <br />
              Type: {toTitleCase(payment.brand)}
              <br />
              Name: {payment.name}
              <br />
            </>
          ) : (
            <>
              You have no payment method. <br />
              <br />
              {addPaymentButton()}
            </>
          )
        }
      />
    );
  }

  if (payment !== null && plan?.is_custom) {
    paymentElement = (
      <GliffCard
        title="Payment Details"
        el={<>Please contact us to change or update your payment method</>}
      />
    );
  }

  const invoicesElement = (
    <GliffCard
      title="Invoices"
      el={
        !invoices ? (
          <LoadingSpinner />
        ) : (
          <table className={classes.baseTable}>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Billing Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(
                ({ number, status, invoice_pdf, amount_due, created }) => {
                  const date = new Date(created * 1000);
                  return (
                    <tr key={number}>
                      <td>{number}</td>
                      <td>{date.toLocaleDateString()}</td>
                      <td>£{amount_due / 100}</td>
                      <td>{toTitleCase(status)}</td>
                      <td>
                        <a href={invoice_pdf} target="_blank" rel="noreferrer">
                          <SVG src={imgSrc("download-icon")} />
                        </a>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )
      }
    />
  );

  const addonForm = !addonPrices ? (
    <LoadingSpinner />
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setAddonFormLoading(true);
        void addAddons(
          parseInt(form.user.value, 10),
          parseInt(form.project.value, 10),
          parseInt(form.collaborator.value, 10)
        ).then(() => {
          setAddonFormLoading(false);
          form.user.reset();
          form.project.reset();
          form.collaborator.reset();

          setAddonDialogOpen(false);
        });
      }}
    >
      {addonTypes.map((addon) => {
        if (!addonPrices[addon]) return null;
        return (
          <div key={addon}>
            <label htmlFor={addon}>
              Additional {addon} @ £{(addonPrices[addon] as number) / 100}:
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <input name={addon} type="number" min="0" {...form[addon].bind} />
            </label>
            <br />
            <br />
          </div>
        );
      })}
      Total: £
      {(
        addonTypes
          .filter((addon) => addonPrices[addon] !== null)
          .reduce(
            (total, addon) =>
              total +
              (addonPrices[addon] as number) * parseInt(form[addon].value, 10),
            0
          ) / 100
      ).toFixed(2)}{" "}
      per month
      <SubmitButton loading={addonFormLoading} value="Confirm" />
    </form>
  );

  if (!auth?.user) return <></>;
  // Replace Dialog when Style 9 hits
  return (
    <div style={{ margin: "20px" }}>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          {planElement}
        </Grid>
        <Grid item xs={3}>
          {usageElement}
        </Grid>
        <Grid item xs={9}>
          {invoices === false ? null : invoicesElement}
        </Grid>
        <Grid item xs={3}>
          {payment === false ? null : paymentElement}
        </Grid>

        <Dialog
          open={addonDialogOpen}
          onClose={() => setAddonDialogOpen(false)}
        >
          <DialogTitle className={classes.dialogTitle}>
            Add ons
            <BaseIconButton
              tooltip={{
                name: "Close",
                icon: imgSrc("close"),
              }}
              onClick={() => setAddonDialogOpen(false)}
            />
          </DialogTitle>
          <DialogContent style={{ padding: "10px" }}>{addonForm}</DialogContent>
        </Dialog>
      </Grid>
    </div>
  );
}
