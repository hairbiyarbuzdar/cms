# Patients

`/patients` follows a summary → filters → register layout. The existing sidebar
and global design tokens remain the visual authority; the supplied image is a
layout reference only.

The four summary counts show all patients, today's registrations, registrations
since Monday, and registrations since the first of the month. Counts are live,
independent of list filters, and use Asia/Karachi calendar boundaries. No sample
counts or unsupported percentage changes are displayed.

The list supports name, phone, automatic patient number, gender, status, and
inclusive registration-date filters. Page sizes are 8 (default), 25, or 50.
Pagination preserves filters. The compact table includes initials, patient code,
age, gender, phone, registration date/time, status, and a details action.

On wide screens registration is an inline right-side panel, with Close and Cancel.
On smaller screens the Register patient button opens the accessible native modal.
The same form and validation are used in both places. Only full name is required.
Phone, age at registration, birth date, gender, address, external ID/CNIC, and notes
are optional. Patient numbers are assigned automatically. External identifiers,
when provided, must be unique. Existing patient records keep their information
and receive Active status by default.

Age is calculated from birth date when available. Otherwise the supplied age is
shown as age at registration (the table tooltip explains it); no birth date is
fabricated from an age. The details dialog displays address, identifier and notes,
and can mark a patient active/inactive. Existing patients can be viewed without
changing their status; no delete controls are introduced.

Failed registrations preserve inputs. A stable submission key prevents duplicate
registrations on retry, including concurrent requests. Successful registrations
refresh the list and dashboard.

USER and ADMIN accounts may list, register, view, export, and change status within
the current single-clinic permission model. Every data operation is authorized
server-side; no patient data is publicly accessible or globally cached.

Export CSV downloads matching patients (up to 5,000 records), regardless of page.
It includes patient number, name, age, gender, phone, registration timestamp, and
status. Private notes, address and CNIC are excluded. Spreadsheet formula prefixes
are escaped. Narrow filters if the matching list exceeds the export limit.

`npm.cmd run test:patients` covers validation, retry safety, migration preservation,
filters, summary counts, pagination, and external-identifier uniqueness using an
isolated temporary PostgreSQL schema. Editing clinical details and patient deletion
are outside this module.
