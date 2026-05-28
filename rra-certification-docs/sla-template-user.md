# SERVICE LEVEL AGREEMENT (SLA)
## SOFTWARE SUPPORT & MAINTENANCE SERVICES (TAX PAYER EDITION)

---

**This Agreement is entered into on this _______ day of ____________, 20__ by and between:**

1. **THE SOFTWARE SUPPLIER:** 
   * **Company Name:** Ubaka Tech Ltd
   * **Registered Address:** Kigali, Rwanda
   * **Represented by:** Benit Gilbert (Managing Director)
   * **Contact Email:** support@ubakatech.com
   * *(hereinafter referred to as the "Supplier")*

**AND**

2. **THE TAXPAYER / CLIENT:**
   * **Company Name:** __________________________________________________
   * **Registered TIN:** __________________________________________________
   * **Physical Address:** __________________________________________________
   * **Represented by:** __________________________________________________
   * *(hereinafter referred to as the "Taxpayer")*

---

### 1. Purpose & Objectives
The purpose of this Agreement is to define the Service Levels, roles, responsibilities, and support metrics provided by the Supplier to the Taxpayer for the maintenance and operations of the **Kuri Macye e-Commerce & Point of Sale (POS)** system, with specific emphasis on ensuring continuous compliance with the Rwanda Revenue Authority (RRA) Electronic Billing Machine (EBM) API standards.

### 2. Scope of Services
The Supplier agrees to provide the following services:
* **System Availability:** Hosting, database maintenance, and performance optimization of the Kuri Macye POS and online checkout storefront.
* **EBM Compliance Maintenance:** Updating and adjusting the OSDC/VSDC API integration middleware to strictly match RRA's technical updates, ensuring all sales receipts are signed and recorded legally.
* **Troubleshooting & Bug Fixing:** Resolution of software errors, interface glitches, and POS connectivity blockages.
* **Backup Management:** Performing automated daily secure backups of inventory, client files, and historical EBM transaction records.

### 3. Service Level Targets (SLA)
The Supplier commits to the following availability and response parameters:

#### 3.1 Uptime Guarantee
The Kuri Macye backend API and cloud database will maintain a **99.9% Uptime** monthly, excluding scheduled maintenance windows (which must be communicated to the Taxpayer 48 hours in advance and executed between 11:00 PM and 4:00 AM CAT).

#### 3.2 Support Response & Resolution Times
Incidents reported by the Taxpayer will be classified and resolved according to the following matrix:

| Severity Level | Definition | Response Time | Resolution Time |
| :--- | :--- | :--- | :--- |
| **Severity 1 (Critical)** | POS Checkout is completely down; RRA EBM receipts cannot be generated (system-wide blockage). | Under **2 Hours** | Under **8 Hours** |
| **Severity 2 (High)** | A major feature is non-functional (e.g., product creation or inventory adjustment fails), but POS checkout is still working. | Under **6 Hours** | Under **24 Hours** |
| **Severity 3 (Medium)** | General system warnings or performance degradation (minor delays) that do not block day-to-day operations. | Under **12 Hours** | Under **48 Hours** |
| **Severity 4 (Low)** | General questions, configuration requests, or feature requests. | Under **24 Hours** | As scheduled |

### 4. Duties & Responsibilities

#### 4.1 The Supplier agrees to:
* Ensure that the Kuri Macye platform generates local EBM signatures and QR code strings compliant with RRA specifications during internet outages (Offline Failover Mode).
* Retain copies of transaction data and synchronization queues to guarantee that zero tax invoices are lost.
* Provide technical training to the Taxpayer's administrators on EBM management.

#### 4.2 The Taxpayer agrees to:
* Provide reliable internet connectivity at the POS terminal location.
* Configure correct and valid RRA credentials (TIN, SDC Device ID, MRC Machine Number, and cryptokeys) supplied by RRA within their Kuri Macye seller panel.
* Notify the Supplier immediately upon detecting any receipt signing failures.

### 5. Term & Termination
* This Agreement is valid for an initial period of **one (1) year** from the date of execution.
* It shall automatically renew for successive one-year terms unless terminated by either party with a **thirty (30) days written notice**.
* In the event of persistent failure by the Supplier to meet Severity 1 SLAs (more than 3 times in a calendar quarter), the Taxpayer reserves the right to terminate the contract immediately without penalty.

---

### IN WITNESS WHEREOF, the parties hereto have signed this SLA:

**For the Software Supplier:**

_______________________________________  
*Benit Gilbert, Managing Director*  
**Ubaka Tech Ltd**  
Date: ____/____/20___

<br/>

**For the Taxpayer / Client:**

_______________________________________  
*Name & Title:* _________________________  
**Company:** ___________________________  
Date: ____/____/20___
