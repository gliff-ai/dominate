import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getInvoices, getPlan } from "@/services/billing";
import { Invoice, Plan } from "@/services/billing/interfaces";

export function Billing(): JSX.Element {
  const auth = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    void getPlan().then(setPlan);
    void getInvoices().then(setInvoices);
  }, []);

  const usageElement = !plan ? null : (
    <>
      <h2>Plan Usage</h2>
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
              {plan.projects} of {plan.projects_limit ?? "Unlimited"}
            </td>
          </tr>
          <tr>
            <td>Users</td>
            <td>
              {plan.users} of {plan.users_limit ?? "Unlimited"}
            </td>
          </tr>
          <tr>
            <td>Collaborators</td>
            <td>
              {plan.collaborators} of {plan.collaborators_limit ?? "Unlimited"}
            </td>
          </tr>
          <tr>
            <td>Storage</td>
            <td>
              {plan.storage / 1000}Gb used.{" "}
              <p>
                Your current plan includes {plan.storage_included_limit / 1000}
                GB
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );

  const planElement = !plan ? null : (
    <>
      <h2>Plan</h2>
    </>
  );

  const invoicesElement = !invoices ? null : (
    <>
      <h2>Invoices</h2>
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
    </>
  );
  return (
    <>
      <h1>Billing</h1>

      {usageElement}

      {invoicesElement}

      {planElement}
    </>
  );
}
