# SOFTWARE SUPPORT & COMPLIANCE AGREEMENT
## REGULATORY COMMITMENT FOR EBM INTEGRATION (RRA EDITION)

---

**This Commitment and Service Level Agreement is executed on this _______ day of ____________, 20__ by:**

**THE SOFTWARE PROVIDER / SYSTEM SUPPLIER:**
* **Company Name:** Ubaka Tech Ltd
   * **TIN (Supplier):** __________________________________________________
   * **Physical Address:** Kigali, Rwanda
   * **Represented by:** Benit Gilbert (Managing Director)
   * **Contact Email:** cis_sdc_certification@rra.gov.rw *(For Certification Department)*
   * *(hereinafter referred to as the "Supplier")*

**IN RELATION TO:**
* **System Name:** Kuri Macye E-Commerce & Point of Sale (POS)
* **Integration Model:** Online Sales Data Controller (OSDC) API
* **Target Regulatory Body:** Rwanda Revenue Authority (RRA)

---

### 1. Purpose of Commitment
This document establishes the Software Supplier's legal and technical commitment to the **Rwanda Revenue Authority (RRA)**. It certifies that the **Kuri Macye** invoicing system is architected, operated, and maintained in absolute alignment with RRA's CIS (Certified Invoicing System) and SDC specifications, ensuring the collection of state taxes is uncompromised and fully transparent.

### 2. Software Compliance & Mathematical Integrity
The Supplier guarantees that:
* **Accurate Calculations:** The invoicing engine calculates VAT accurately (Tax Type B at 18%, Tax Type A as Exempt/0%) based on the formulas prescribed in the RRA OSDC/VSDC technical specifications:
  $$\text{Taxable Amount (B)} = \text{Gross Amount} \div 1.18$$
  $$\text{Tax Amount (B)} = \text{Gross Amount} - \text{Taxable Amount}$$
* **No Signature Bypassing:** The checkout process requires an RRA-verified cryptographic signature (`rcptSign`) and internal data key (`intrlData`) before a receipt is marked as legally completed.
* **Format Compliance:** All transaction receipts display the mandated verification QR code using the format:
  `ddMMyyyy#hhmmss#sdcId#rcptNo#intrlData#rcptSign`

### 3. API Maintenance & Lifecycle Support
* **Specification Alignment:** The Supplier commits to monitoring all updates to RRA's technical guidelines.
* **Update SLA:** Upon receiving official notice of API version changes or SDC infrastructure updates from RRA, the Supplier will adjust, test, and deploy software updates to the Kuri Macye platform within RRA's designated migration grace period.

### 4. Technical Security & Audit Access
* **No Tampering:** The database schemas are designed with audit log structures. Transactions, once saved, cannot be modified or deleted. Credit notes and refunds are submitted to RRA as distinct, linked adjustment invoices (`orgInvcNo` reference).
* **Audit Readiness:** The Supplier will provide RRA technicians with read-only dashboard access or physical inspectability to audit invoice databases, source code files, and server logs upon official request.

### 5. Security Incident Escalation (24-Hour SLA)
In the event that:
1. A security vulnerability is detected in the system's EBM signature module,
2. An attempt at unauthorized database alteration of tax records is discovered, or
3. A client taxpayer is found to be attempting to bypass the OSDC interface,

The Supplier commits to reporting the incident to RRA's SDC Certification and Security Team (**cis_sdc_certification@rra.gov.rw**) within **twenty-four (24) hours** of discovery, alongside a detailed diagnostic report and action plan.

---

### IN WITNESS WHEREOF, the Supplier has executed this Commitment:

**For the Software Supplier:**

_______________________________________  
*Benit Gilbert, Managing Director*  
**Ubaka Tech Ltd**  
Date: ____/____/20___

<br/>

**Acknowledged & Reviewed for Rwanda Revenue Authority (RRA):**

_______________________________________  
*Authorized Representative*  
**EBM Certification / CIS-SDC Unit**  
Date: ____/____/20___
