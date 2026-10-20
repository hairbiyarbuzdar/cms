# Clinic dashboard

`/dashboard` is available to authenticated USER and ADMIN accounts. It uses live
PostgreSQL queries after authorization; no patient or sales data is cached globally.

- Total patients: registrations up to the current time, independent of the filter.
- New patients: registrations within the selected period.
- Medicine sales: sum of quantity × historical unit price on completed sale items,
  in PKR. This is gross medicine sales, before discounts or tax; it is not profit.
- Units sold: completed sale item quantities, not number of transactions.
- Top medicines: five medicines ranked by units, then sales value for ties.
- Stock watch: current stock at or below each medicine's reorder level, including
  out-of-stock items. This is independent of the reporting period.

The default is 30 days, with 7- and 90-day alternatives. Each period includes today
and the preceding N−1 calendar days in Asia/Karachi. Future-dated, voided, and
fully refunded sales are excluded. Daily chart dates without sales are zero-filled.

Patient, Medicine, Sale, and SaleItem models provide the data foundation. Prices
use decimal arithmetic in PostgreSQL. Database checks reject negative stock,
nonpositive quantities, and negative prices. Each dashboard read uses a consistent
transaction snapshot. No sample clinical records are inserted into the app.

Patient registration, medicine management, and sale-entry forms are separate
modules to build next. Until data is recorded, the dashboard shows zero values
and explicit empty states. Sales stock changes must be handled transactionally by
the future sale-entry module; the dashboard does not mutate inventory.

Run `npm.cmd run test:dashboard` for period tests and PostgreSQL integration tests.
The integration test uses a uniquely named temporary schema, cleans it up, and
does not modify application records. Its database account needs CREATE permission.
