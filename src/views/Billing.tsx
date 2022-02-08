import { useEffect, useState, Dispatch, SetStateAction } from "react";
import SVG from "react-inlinesvg";
import { Dialog, DialogContent, DialogTitle, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { theme, BaseIconButton, LoadingSpinner } from "@gliff-ai/style";

import {
  addAddons,
  getAddonPrices,
  getInvoices,
  getLimits,
  getPlan,
  getPayment,
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
  const [plan, setPlan] = useState<Plan | null | "CUSTOM">(null);
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

  useEffect(() => {
    if (auth?.user) {
      void getLimits().then(setLimits);
      void getPlan().then((p) => {
        if (p) {
          setPlan(p);
          void getInvoices().then(setInvoices);
          void getPayment().then(setPayment);
        } else {
          setPlan("CUSTOM");
          setInvoices(false);
          setPayment(false);
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
            </tbody>
          </table>
        )
      }
      action={{
        tooltip: "Add Addons",
        icon: imgSrc("add"),
        onClick: () => {
          setAddonDialogOpen(true);
          void getAddonPrices().then(setAddonPrices);
        },
      }}
    />
  );

  let planElement: JSX.Element;
  if (!plan) {
    planElement = <GliffCard title="Plan" el={<LoadingSpinner />} />;
  } else {
    planElement = (
      <GliffCard
        title="Plan"
        el={
          plan !== "CUSTOM" ? (
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <div
                  style={{
                    width: "100%",
                    padding: "75px",
                    textAlign: "center",
                  }}
                >
                  <SVG
                    src={plansMap[plan.tier_name].icon}
                    style={{ width: "100px", height: "100px", margin: "auto" }}
                  />
                </div>
                Your current plan is{" "}
                <strong>{plansMap[plan.tier_name].name}</strong> with{" "}
                <strong>{Object.values(plan.addons).length}</strong> addons
                <br />
                The current period ends on:{" "}
                {new Date(plan.current_period_end * 1000).toLocaleDateString()}
              </Grid>
              <Grid item xs={6}>
                <table className={classes.baseTable}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{plansMap[plan.tier_name].name}</td>
                      <td>£{plan.base_price / 100}</td>
                    </tr>
                  </tbody>
                </table>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {" "}
              <div
                style={{ width: "100%", padding: "75px", textAlign: "center" }}
              >
                <SVG
                  src={plansMap.CUSTOM.icon}
                  style={{ width: "100px", height: "100px", margin: "auto" }}
                />
              </div>
              <h6
                style={{ width: "100%", textAlign: "center", fontSize: "14px" }}
              >
                You are on a custom plan. Please contact us for information and
                invoicing
              </h6>
            </Grid>
          )
        }
      />
    );
  }

  const paymentElement = (
    <GliffCard
      title="Payment Details"
      el={
        !payment ? (
          <LoadingSpinner />
        ) : (
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
        )
      }
    />
  );

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
          <label key={addon} htmlFor={addon}>
            Additional {addon} @ £{(addonPrices[addon] as number) / 100}:
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <input name={addon} type="number" min="0" {...form[addon].bind} />
          </label>
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
      ).toFixed(2)}
      per month
      <SubmitButton loading={addonFormLoading} value="Confirm" />
    </form>
  );

  if (!auth?.user) return <></>;

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
          <DialogContent>{addonForm}</DialogContent>
        </Dialog>
      </Grid>
    </div>
  );
}
