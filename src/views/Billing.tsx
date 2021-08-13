import { useEffect, useState, Dispatch, SetStateAction } from "react";
import SVG from "react-inlinesvg";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { theme, BaseIconButton } from "@gliff-ai/style";

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
import { SubmitButton, GliffCard, LoadingSpinner } from "@/components";

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
  const [limits, setLimits] = useState<Limits | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

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
  } as const;

  const addonTypes = ["user", "project", "collaborator"] as const;

  useEffect(() => {
    void getLimits().then(setLimits);
    void getPlan().then(setPlan);
    void getInvoices().then(setInvoices);
    void getPayment().then(setPayment);
  }, [addonFormLoading]);

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

  const planElement = (
    <GliffCard
      title="Plan"
      el={
        !plan ? (
          <LoadingSpinner />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <div
                style={{ width: "100%", padding: "75px", textAlign: "center" }}
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
        )
      }
    />
  );

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
          form.user.value,
          form.project.value,
          form.collaborator.value
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
            Additional {addon} @ £{addonPrices[addon] / 100}:
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <input name={addon} type="number" min="0" {...form[addon].bind} />
          </label>
        );
      })}
      Total: £
      {(
        addonTypes.reduce(
          (total, addon) =>
            total + addonPrices[addon] * parseInt(form[addon].value, 10),
          0
        ) / 100
      ).toFixed(2)}{" "}
      per month
      <SubmitButton loading={addonFormLoading} value="Confirm" />
    </form>
  );

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
          {invoicesElement}
        </Grid>
        <Grid item xs={3}>
          {paymentElement}
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
