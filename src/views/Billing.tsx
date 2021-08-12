import { useEffect, useState } from "react";
import { Card, Grid, Paper, Typography } from "@material-ui/core";

import { useAuth } from "@/hooks/use-auth";
import {
  getAddonPrices,
  getInvoices,
  getLimits,
  getPlan,
} from "@/services/billing";
import {
  AddonPrices,
  Invoice,
  Limits,
  Plan,
} from "@/services/billing/interfaces";
import { GliffCard } from "@/components/GliffCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { imgSrc } from "@/imgSrc";
import { useInput } from "@/hooks/use-input";
import { SubmitButton } from "@/components";

type FormState = {
  [key in "user" | "project" | "collaborator"]: any;
};
export function Billing(): JSX.Element {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [payment, setPayment] = useState<string | null>(null); // TODO
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [addonPrices, setAddonPrices] = useState<AddonPrices | null>(null);

  const form = {
    user: useInput<number>(0),
    project: useInput<number>(0),
    collaborator: useInput<number>(0),
  } as FormState;

  useEffect(
    () => {
      void getLimits().then(setLimits);
      void getPlan().then(setPlan);
      void getInvoices().then(setInvoices);

      // setPayment("temp");
    },
    [
      /* on addon updaet */
    ]
  );

  const usageElement = (
    <GliffCard
      title="Plan Usage"
      action={{
        tooltip: "Add Addons",
        icon: imgSrc("add"),
        onClick: () => console.log("clicked"),
      }}
      el={
        !limits ? (
          <LoadingSpinner />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Projects</td>
                <td>
                  {limits.projects} of {limits.projects_limit ?? "Unlimited"}
                </td>
              </tr>
              <tr>
                <td>Users</td>
                <td>
                  {limits.users} of {limits.users_limit ?? "Unlimited"}
                </td>
              </tr>
              <tr>
                <td>Collaborators</td>
                <td>
                  {limits.collaborators} of{" "}
                  {limits.collaborators_limit ?? "Unlimited"}
                </td>
              </tr>
              <tr>
                <td>Storage</td>
                <td>
                  {limits.storage / 1000}Gb used.{" "}
                  <p>
                    Your current plan includes{" "}
                    {limits.storage_included_limit / 1000}
                    GB
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        )
      }
    />
  );

  const planElement = (
    <GliffCard
      title="Plan"
      el={
        !plan ? (
          <LoadingSpinner />
        ) : (
          <>
            <p>Your current plan is {plan.tier_name}</p>
            Ends on: {plan.current_period_end}
            base price: {plan.base_price}
            addons: You have {Object.values(plan.addons).length} addons
          </>
        )
      }
    />
  );

  const paymentElement = (
    <GliffCard
      title="Payment Details"
      el={!payment ? <LoadingSpinner /> : <>Payment etc</>}
    />
  );

  const invoicesElement = (
    <GliffCard
      title="Invoices"
      el={
        !invoices ? (
          <LoadingSpinner />
        ) : (
          <table>
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
                      <td>{`${status.charAt(0).toUpperCase()}${status.slice(
                        1
                      )}`}</td>
                      <td>
                        <a href={invoice_pdf} target="_blank" rel="noreferrer">
                          ICON
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

  const addonTypes = ["user", "project", "collaborator"];
  const addonForm = !addonPrices ? (
    <LoadingSpinner />
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log(form);
      }}
    >
      {addonTypes.map((addon) => {
        if (!addonPrices[addon]) return null;
        return (
          <label key={addon}>
            Additional {addon} @ £{addonPrices[addon] / 100}:
            <input type="number" min="0" {...form[addon].bind} />
          </label>
        );
      })}
      Total: £
      {(
        addonTypes.reduce(
          (total, addon) => total + addonPrices[addon] * form[addon].value,
          0
        ) / 100
      ).toFixed(2)}{" "}
      per month
      <SubmitButton loading={false} value="Confirm" />
    </form>
  );

  const addonModal = <GliffCard title="Add-Ons" el={addonForm} />;

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

        <Grid item xs={4}>
          {addonModal}
        </Grid>

        <button
          onClick={() => {
            void getAddonPrices().then(setAddonPrices);
          }}
        >
          get prices
        </button>
      </Grid>
    </div>
  );
}
