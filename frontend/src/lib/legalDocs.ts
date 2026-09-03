export interface LegalSection {
  id: string;
  title: string;
  shortTitle: string;
  badge?: string;
  description: string;
  content: string;
}

export const LEGAL_METADATA = {
  platformBrand: "Omeetso",
  operatorEntity: "Digitalness Industries LLP",
  registeredOffice: "11/1, Main Road, near Indira Gandhi Statue, Prashanthinagar, Prashanth Nagar, Uppal, Hyderabad, Telangana 500039, India",
  websiteUrl: "https://www.omeetso.in",
  generalEmail: "info@omeetso.in",
  grievanceEmail: "info@omeetso.in",
  dataProtectionEmail: "info@omeetso.in",
  effectiveDate: "2 September 2026",
  governingLaw: "Laws of India",
  jurisdiction: "Competent courts in Medchal-Malkajgiri District, Telangana, subject to mandatory law",
  businessModel: "Classifieds / Intermediary marketplace; charges are strictly limited to advertising, featured placement, boosted visibility, or other promotional services.",
  coreTransactionRule: "Omeetso charges only for advertising, featured placement, boosted visibility, or other promotional services. Omeetso does not collect, hold, route, settle, guarantee, escrow, refund, or otherwise participate in the price paid between a buyer and seller for goods, services, property, employment, vehicles, or any other listing. All buyer-seller payments and transactions occur directly and independently off-platform at their own risk.",
};

export const LEGAL_DOCS: LegalSection[] = [
  {
    id: "terms",
    title: "Part I — Platform Terms of Use",
    shortTitle: "Terms of Use",
    badge: "Binding Agreement",
    description: "Electronic record and legally binding terms governing your access to and use of Omeetso.",
    content: `
### 1. Acceptance and binding agreement
These Terms of Use constitute an electronic record and a legally binding agreement between each person accessing or using Omeetso (the "User", "you" or "your") and Digitalness Industries LLP, the legal operator of the Omeetso brand and platform ("Omeetso", "we", "us" or "our"). By accessing the website, application, services, communications, listing tools or paid advertising features, you confirm that you have read, understood and agreed to these Terms, the Privacy Policy, all incorporated policies, and all additional terms displayed for a feature.

If you do not agree, you must not access or use Omeetso. Continued use after a notified revision constitutes acceptance to the extent permitted by law. Mandatory rights that cannot lawfully be waived remain unaffected.

### 2. Nature of Omeetso and intermediary status
Omeetso provides technology that enables Users to create, publish, search, discover and communicate about classified advertisements and nearby offerings. Unless Omeetso expressly identifies itself as the seller in a separate written agreement, Omeetso is not the owner, manufacturer, importer, seller, reseller, auctioneer, broker, employer, recruiter, landlord, tenant, lender, insurer, transporter, payment intermediary, escrow agent, guarantor or representative of any User.

Listings and communications are created by Users. Omeetso does not initiate or control an independent buyer–seller transaction, choose its consideration, take title, inspect every item, verify every statement, guarantee availability or compel performance. Display, ranking, moderation, identity signals or a "verified" indicator does not constitute endorsement, certification, warranty or due diligence by Omeetso.

> **CORE TRANSACTION RULE:** All negotiations, inspections, contracts, delivery, transfer of ownership, taxes, permissions and payments for listed goods or services occur directly between the relevant buyer and seller. Such parties alone are responsible for the transaction and its consequences.

### 3. Eligibility, authority and minors
- You must be legally competent to contract under applicable Indian law.
- A minor may not independently create an account, publish a listing, purchase advertising, or transact through contacts obtained on Omeetso.
- If using Omeetso for an entity, you represent that you have authority to bind that entity.
- Omeetso may request age, identity, business or authority verification and may restrict access when verification is incomplete or unreliable.

### 4. Account registration and credentials
You must provide accurate, current and complete information and keep it updated. You are responsible for protecting passwords, one-time-password access, devices, email accounts and mobile numbers connected with your account. You must not share credentials, sell or transfer an account, impersonate another person, or evade a suspension by creating another account.

Activity performed through your account may be treated as authorised by you until Omeetso receives sufficient notice of compromise. Notify **info@omeetso.in** immediately of suspected unauthorised access. Omeetso may secure, lock, suspend or require re-verification of an account where misuse, fraud, compromise or legal risk is suspected.

### 5. User listings, representations and responsibility
Each User who uploads or communicates content represents and warrants that:
- The User has lawful authority to offer the subject matter;
- The information is accurate and not misleading;
- Required disclosures, registrations, licences and permissions have been obtained;
- Images are authentic or clearly illustrative;
- The price and material conditions are disclosed; and
- The content does not infringe third-party rights or law.

Users must independently evaluate counterparties, inspect goods, verify ownership and documents, confirm licences, test functionality, obtain professional advice where needed, use safe meeting locations and use lawful payment methods. Omeetso is not responsible for a User's failure to conduct appropriate diligence.

### 6. Communications and contact sharing
Omeetso may enable chat, calls, masked contact, notifications or other communication tools. Users consent to receiving service communications necessary to operate accounts and listings. Marketing communications will be sent subject to applicable consent and opt-out requirements. Users must not harass, threaten, spam, scrape, solicit unlawfully or use another User's contact details for unrelated purposes.

### 7. Paid advertising and promotional services
Omeetso may charge for featured listings, boosts, top placement, banners, sponsored content, seller promotion, subscriptions or other visibility products ("Advertising Services"). Advertising fees purchase only the defined promotional service for the stated period, territory, category and account. They do not purchase a sale, enquiry, impression minimum, ranking permanence, lead quality, transaction outcome or revenue guarantee unless expressly stated in a written order.

Omeetso may identify paid promotions as "Sponsored", "Featured", "Promoted" or similar. Organic and paid ranking may consider relevance, location, freshness, quality, policy compliance, user experience, fraud risk and system factors. Omeetso may refuse, pause or remove advertising that violates law or policy.

### 8. Buyer–seller payments expressly excluded
Omeetso does not provide a payment gateway, wallet, escrow, settlement, collection, cash-on-delivery service, financing or payment guarantee for the consideration payable under a buyer–seller transaction. Any bank transfer, UPI payment, cash payment, card payment, deposit, advance, token amount, loan, instalment, courier payment or other transfer exchanged between Users is made outside Omeetso and strictly at their own risk and responsibility.

Omeetso is not liable to recover, reverse, refund, trace, insure or compensate such payment; resolve a chargeback; enforce delivery; or reimburse fraud, counterfeit goods, non-performance or misrepresentation. A User must promptly contact the relevant bank/payment provider and law-enforcement authorities in the event of suspected fraud.

### 9. Advertising fees, taxes and payment processors
Payments made to Omeetso are limited to Advertising Services and may be processed by an independent authorised payment service provider. The provider's terms and privacy practices may apply. Users authorise Omeetso and the provider to process transaction identifiers, billing details, payment status and legally required records. Omeetso may issue an invoice and collect applicable taxes. Users are responsible for correct billing and tax information.

### 10. Refunds and cancellations
Except where required by law or expressly stated in the applicable order, advertising fees are non-refundable once the promotion has commenced, impressions or placement have been delivered, or platform resources have been allocated. Failure to obtain enquiries, leads or a sale is not a service failure. Duplicate charges, payment captured without activation, or a material platform error should be reported within seven days with evidence. Approved refunds will ordinarily be returned to the original method, subject to processor timelines.

Omeetso may provide a replacement promotional period, advertising credit or proportionate refund where Omeetso confirms a material failure attributable solely to Omeetso. No refund is due where a listing is removed for User breach, illegality, fraud risk, inaccurate content, regulatory direction or prohibited goods.

### 11. Moderation, removal and enforcement
Omeetso may use automated tools, human review and User reports to detect risk. Without creating a general monitoring obligation, Omeetso may reject, edit for formatting, restrict, de-rank, label, disable, remove, preserve or disclose content; limit communications; hold publication; suspend or terminate accounts; block devices; and cooperate with authorities where reasonably necessary for policy enforcement, safety, legal compliance or protection of rights.

Omeetso may act without prior notice when urgency, fraud, cybersecurity, legal obligations or risk to Users requires it. Where appropriate, Omeetso may provide a reason and review channel. Omeetso is not liable for good-faith moderation or temporary restrictions, subject to mandatory law.

### 12. Prohibited conduct
Users shall NOT:
- Publish illegal, stolen, counterfeit, unsafe, recalled or prohibited items.
- Misrepresent identity, ownership, condition, price, location, qualifications, employment, property rights or commercial intent.
- Demand advance money through deceptive urgency, fake courier links, QR-code collection scams, OTP requests or impersonation.
- Upload malware, interfere with security, reverse engineer systems, probe vulnerabilities without authorisation, or conduct denial-of-service activity.
- Scrape, harvest, copy, index or commercially exploit platform data except through authorised interfaces.
- Manipulate rankings, reviews, reports, clicks or engagement; create duplicate listings; or use bots and fake accounts.
- Discriminate unlawfully, exploit children, traffic persons, facilitate violence, or publish hateful, obscene, defamatory, privacy-invasive or threatening content.
- Use Omeetso to launder money, evade taxes, violate sanctions, finance unlawful activity or conceal proceeds of crime.

### 13. Intellectual property and content licence
Omeetso and its licensors retain all rights in the platform, software, databases, design, trademarks, logos, taxonomy and original content. No right is granted except a limited, revocable, non-exclusive, non-transferable licence to use the service for its intended purpose.

You retain ownership of User Content. By submitting it, you grant Omeetso a worldwide, non-exclusive, royalty-free, sublicensable and transferable licence to host, reproduce, adapt for technical formatting, translate, publish, display, distribute, promote and communicate that content for operating, securing, improving and marketing Omeetso and the listing, until deletion subject to backups, evidence preservation and lawful retention. You represent that you have rights necessary to grant this licence.

### 14. Third-party services and links
Maps, messaging, analytics, identity checks, cloud hosting, payment processing for advertising, social logins and external links may be supplied by third parties. Their terms apply separately. Omeetso does not control or warrant third-party availability, security, content, pricing or performance and is not responsible for transactions conducted with third parties.

### 15. Disclaimers
To the maximum extent permitted by law, Omeetso is provided on an "as is" and "as available" basis. Omeetso disclaims implied warranties of merchantability, fitness, title, non-infringement, uninterrupted availability, accuracy, security, compatibility and transaction success. Omeetso does not warrant any User, listing, item, service, job, employer, property, document, price, lead, review, location, message or payment.

Security measures reduce but cannot eliminate all risk. Omeetso does not guarantee that the platform or stored information will never be accessed, altered, lost or unavailable through sophisticated attacks, User error, third-party failure, force majeure or events beyond reasonable control.

### 16. Limitation of liability
To the fullest extent permitted by law, Omeetso and its affiliates, directors, partners, employees, contractors and service providers shall not be liable for indirect, incidental, special, exemplary, punitive or consequential loss; loss of profit, revenue, goodwill, opportunity or data; transaction loss; personal injury or property loss caused by a User; fraud by a third party; counterfeit or defective goods; non-delivery; employment or property disputes; or payments exchanged outside Omeetso.

Where liability cannot be excluded, Omeetso's aggregate liability arising from a claim shall not exceed the advertising fees actually paid by the claimant to Omeetso for the specific Advertising Service giving rise to the claim during the three months preceding the event, or INR 1,000, whichever is greater, except where a different limit is required by non-excludable law. Nothing excludes liability that cannot legally be excluded, including for Omeetso's proven fraud or wilful misconduct.

### 17. Indemnity
You shall defend, indemnify and hold harmless Omeetso and its affiliates, officers, partners, employees and service providers from claims, investigations, losses, penalties, damages, liabilities and reasonable legal costs arising from your content, listing, goods, services, conduct, transaction, taxes, infringement, violation of law, breach of these Terms, misuse of personal data, or dispute with another User. Omeetso may control the defence and settlement of a matter affecting it; you shall reasonably cooperate and shall not settle an obligation against Omeetso without written consent.

### 18. Suspension, termination and survival
You may stop using Omeetso and request account deletion. Omeetso may suspend or terminate access for breach, risk, inactivity, legal request, operational discontinuation or protection of Users. Termination does not erase accrued obligations, advertising charges, transaction responsibilities, evidence or data lawfully retained. Provisions intended by nature to survive—including ownership, disclaimers, indemnity, liability, disputes and lawful retention—survive termination.

### 19. Governing law and disputes
These Terms are governed by the laws of India. Parties should first provide written notice to **info@omeetso.in** and attempt good-faith resolution for thirty days. Subject to mandatory consumer jurisdiction and other non-waivable rights, the competent courts in Medchal-Malkajgiri District, Telangana shall have exclusive jurisdiction. Omeetso may seek urgent injunctive or protective relief in any competent court.

### 20. General provisions
These Terms and incorporated policies form the entire agreement for platform use. If a provision is invalid, it shall be modified to the minimum extent necessary and the remainder continues. Omeetso's delay is not a waiver. Users may not assign rights without consent; Omeetso may assign to an affiliate or successor. Electronic notices may be delivered in-app, by email, SMS or website publication. Force majeure excuses delay caused by events beyond reasonable control.
    `,
  },
  {
    id: "privacy",
    title: "Part II — Privacy Policy",
    shortTitle: "Privacy Policy",
    badge: "DPDP Act Compliant",
    description: "How Omeetso collects, uses, protects, processes, retains and deletes personal data.",
    content: `
### 1. Scope and data-fiduciary role
This Privacy Policy explains how Omeetso collects, receives, generates, uses, stores, shares, protects and deletes personal data when you access the platform, create an account, publish or respond to listings, communicate, buy Advertising Services, contact support or otherwise interact with us. Digitalness Industries LLP, as the legal operator of the Omeetso brand and platform, is the relevant data fiduciary/controller for processing described here, unless another entity is expressly identified.

This Policy is intended to be read with the Terms and feature-specific notices. Where applicable law requires consent, Omeetso will seek consent that is free, specific, informed, unconditional and unambiguous through clear affirmative action. Certain processing may also occur for legitimate uses or legal obligations recognised by applicable law.

### 2. Categories of information collected

#### 2.1 Account and identity data
- Name, display name, username, date or age declaration, profile photograph and account identifiers.
- Mobile number, email address, postal or business address and communication preferences.
- Password hashes, OTP events, login method, authentication tokens, device-linked security signals and account recovery data.
- Government, business, tax, licence, ownership or identity documentation only where needed for verification, higher-risk categories, fraud prevention or law.

#### 2.2 Listing and transaction-context data
- Listing title, description, price, category, photographs, videos, documents, condition, location and availability.
- Seller type, business name, working hours, website, social handle and service areas.
- Buyer enquiries, offer context, saved listings, favourites, searches and engagement.
- Information voluntarily exchanged in chat or support, excluding any claim that Omeetso controls the resulting transaction.

#### 2.3 Advertising and billing data
- Advertising order, campaign, placement, duration, invoice, tax and billing information.
- Payment status, amount, currency, transaction reference, processor response and fraud indicators.
- Omeetso generally does not need full card, bank or UPI credentials; such data may be collected directly by the independent payment processor.

#### 2.4 Device, technical and usage data
- IP address, approximate location derived from IP, device identifiers, browser, operating system, language, time zone and network information.
- Access timestamps, pages/screens viewed, clicks, searches, referring URLs, crashes, diagnostic logs and performance information.
- Cookie, SDK, pixel and similar-technology identifiers, subject to applicable notice and choice.
- Security events such as failed logins, suspicious patterns, reports, blocks and moderation history.

#### 2.5 Location data
Omeetso may request approximate or precise device location to show nearby listings, set a search radius, reduce fraud or attach a listing location. Precise location should be collected only after device permission or other valid legal basis. You can withdraw device permission, but location-dependent features may not function. Public listing locations should be generalised where precise disclosure is unnecessary for safety.

#### 2.6 Communications and support
We may process emails, support tickets, complaint evidence, recorded calls where notified and permitted, survey responses, grievance records, law-enforcement correspondence and communications made through platform tools. Users should not share passwords, OTPs, financial credentials or unnecessary sensitive information in listings or chat.

#### 2.7 Information from third parties
We may receive information from login providers, identity-verification vendors, fraud databases, payment processors for advertising, analytics providers, delivery of communications, publicly available sources, other Users making reports, and competent authorities. We assess and use such data only for relevant purposes.

### 3. Purposes of processing
- Create, authenticate, administer, secure and recover accounts.
- Publish, index, rank, localise, recommend and promote listings.
- Enable contact and communications between Users.
- Provide Advertising Services, invoices, payment confirmation and customer support.
- Personalise content and measure platform and advertising performance.
- Detect spam, scams, account compromise, policy violations and illegal activity.
- Moderate content, investigate reports, enforce policies and preserve evidence.
- Maintain security, logs, backups, resilience and service continuity.
- Comply with legal duties, court orders, government requests and regulatory reporting.
- Establish, exercise or defend legal claims and protect persons, property and rights.
- Conduct research, analytics and product improvement using aggregated or de-identified information where feasible.
- Send marketing only in accordance with applicable consent and opt-out requirements.

### 4. Legal grounds and consent management
Depending on the context and applicable law, processing is based on your consent; data voluntarily provided for a specified service; performance of the User agreement; compliance with law; protection against fraud and cybersecurity threats; response to emergencies; or other legitimate uses permitted by law. Withdrawal of consent does not affect processing already lawfully performed and may prevent features that require the relevant data.

Consent records may include the notice version, timestamp, account, device or session signal, purpose and withdrawal event. Users may withdraw optional consent through available settings or by contacting **info@omeetso.in**. Omeetso will stop consent-based processing within a reasonable period unless retention or processing is otherwise required or authorised by law.

### 5. Public information and User-directed disclosure
Listings are intended for public discovery. Listing content, seller display information, approximate location and selected contact options may be visible to the public, search engines or other Users according to settings. Once information is copied, indexed or shared by others, Omeetso cannot guarantee removal from every external location. Do not publish home addresses, IDs, financial details or information you lack authority to disclose.

### 6. Sharing and disclosure
Omeetso does not sell personal data merely in exchange for money. We may disclose limited data to:
- Other Users, as directed by listing and communication features.
- Cloud, hosting, storage, content-delivery, cybersecurity, analytics, customer-support and communication providers acting under contract.
- Advertising payment processors, banks and tax/invoicing providers for Omeetso Advertising Services.
- Identity, fraud-prevention, moderation and verification vendors.
- Professional advisers, auditors, insurers, investors and transaction counterparties subject to confidentiality.
- Affiliates or a successor in a merger, financing, reorganisation or asset transfer, with appropriate safeguards.
- Government, courts, regulators or law enforcement where required by valid process, or where reasonably necessary to prevent serious harm, fraud, cyber incidents or unlawful conduct.
- Rights holders and complainants where necessary to process a lawful notice, while avoiding unnecessary disclosure.

Service providers may process data only for documented purposes, must apply appropriate safeguards, and must delete or return data subject to contract and law.

### 7. Advertising and analytics
Omeetso may measure views, clicks, searches, conversions and campaign performance for Advertising Services. We may use first-party analytics and third-party tools. Where personalised advertising or non-essential tracking requires consent, Omeetso will provide notice and choice. Aggregate campaign reports may be shared with advertisers without identifying individual Users unless separately disclosed and lawfully authorised.

### 8. Data security
Omeetso implements reasonable technical and organisational safeguards appropriate to the nature, scope and risk of processing. Measures include encryption in transit and where appropriate at rest; password hashing; access controls and least privilege; MFA for privileged access; secure development and patching; network and application monitoring; backups; vendor assessment; incident response; audit logs; anti-abuse controls; employee confidentiality and security training; and periodic review.

No internet service is absolutely secure. Users acknowledge residual risk and are responsible for device security, strong unique passwords, protecting OTPs, avoiding phishing links and promptly reporting compromise. Omeetso will notify affected persons and authorities of a personal-data breach where and within the period required by applicable law.

### 9. Data retention schedule

| Data Class | Indicative Retention Approach |
| :--- | :--- |
| **Account / profile** | While active and for a reasonable closure period; longer where needed for fraud prevention or claims. |
| **Listings / content** | While published; archived copies may remain for moderation, disputes, legal compliance and backups. |
| **Advertising invoices** | For statutory tax, accounting and audit periods (typically 7–8 years under Indian tax laws). |
| **Security logs** | For the period required by applicable cybersecurity directions and risk needs; certain logs are maintained for at least 180 days under CERT-In directions. |
| **Support / grievances** | Until resolved plus a reasonable legal and audit limitation period. |
| **Verification records** | Only as necessary for verification, fraud prevention and law, with strict access restrictions. |
| **Backups** | Until overwritten under the backup cycle, unless preserved for legal hold. |

Deletion requests do not require Omeetso to delete data that must be retained for law, fraud prevention, security, exercise or defence of claims, or integrity of records. Retained data will be restricted to the relevant purpose where feasible.

### 10. Cross-border and third-party processing
Omeetso may use service providers whose systems or support personnel are located outside your State or outside India, subject to applicable transfer restrictions, contractual safeguards and notified government requirements. The locations and providers may change as infrastructure evolves.

### 11. User rights
Subject to verification, exceptions and applicable law, you may request:
- Access to a summary of personal data and processing activities;
- Correction, completion or updating of inaccurate data;
- Erasure where retention is no longer necessary or legally required;
- Withdrawal of consent for consent-based processing;
- Grievance redressal and information about available escalation;
- Nomination of another individual to exercise rights in the event of death or incapacity, where applicable;
- Account deletion and cessation of optional marketing.

Submit requests to **info@omeetso.in** from the registered email or with sufficient verification. Omeetso may request information proportionate to prevent unauthorised access. Requests may be refused or limited where manifestly fraudulent, another person's rights are affected, or law permits retention; reasons will be provided where required.

### 12. Children
Omeetso is not intended for independent use by children who cannot lawfully contract. Omeetso does not knowingly permit a child to publish listings or purchase Advertising Services. If child data is processed in a feature, Omeetso will seek verifiable parental consent and apply applicable restrictions. A parent or guardian may report suspected child data to **info@omeetso.in** for review and deletion where appropriate.

### 13. Automated systems and ranking
Omeetso may use automated rules or machine-assisted systems to rank listings, recommend content, detect fraud, identify prohibited content and prioritise review. Signals may include location, relevance, freshness, completeness, engagement, paid promotion, reports, account history and risk indicators. Automated signals may be incorrect; Users may submit a grievance concerning a material restriction.

### 14. Changes to this Privacy Policy
Omeetso may update this Policy for legal, operational, security or feature changes. Material changes will be communicated by reasonable means and, where required, renewed consent will be obtained. The effective date and archived version should be maintained on the platform.
    `,
  },
  {
    id: "advertising-refund",
    title: "Part III — Advertising, Payment and Refund Policy",
    shortTitle: "Advertising & Refunds",
    badge: "Payments Policy",
    description: "Terms governing purchase, activation, cancellation and refunds for paid advertising on Omeetso.",
    content: `
### 1. Scope
This Policy applies only to money paid directly to Omeetso for Advertising Services (such as Featured Listings, Top Placement, Banner Ads, and Boosted Visibility). **It does not apply to money exchanged between buyers and sellers, which Omeetso neither handles, holds, routes nor guarantees.**

### 2. Advertising order
- The order will state the listing/account, product, duration, geography/category, price and applicable taxes.
- Activation is subject to successful payment, policy review and technical availability.
- Advertising inventory, ranking and impressions may fluctuate; no exclusive position is promised unless expressly stated in writing.
- A User must review the listing before activation and remains responsible for legality and accuracy.

### 3. Pricing and billing
Prices may change prospectively and may vary by category, territory, duration, demand or account. Taxes and processor charges will be shown where applicable. Promotional coupons have stated conditions, no cash value, may not be combined and may be withdrawn for misuse.

### 4. Payment failure and chargebacks
If an advertising payment fails, is reversed, disputed or charged back, Omeetso may suspend the Advertising Service, recover the amount, offset credits, restrict the account and provide evidence to the processor. A chargeback must not be used to avoid a valid charge after the service was delivered.

### 5. Refund eligibility
A refund or replacement credit for Advertising Services may be granted in the following scenarios:
1. Duplicate debit for the same order.
2. Payment captured but the purchased promotion was never activated due solely to a confirmed Omeetso technical error.
3. A material service outage attributable solely to Omeetso that prevented substantially all contracted delivery.
4. A refund required by non-excludable applicable law.

### 6. Non-refundable situations
The following situations are **strictly non-refundable**:
- Promotion delivered in whole or part.
- No enquiries, low engagement, no sale or dissatisfaction with market response.
- User cancellation after activation.
- Removal or suspension caused by User breach, prohibited content, fraud risk or legal direction.
- Incorrect targeting, text, images or account details supplied or approved by the User.
- Buyer–seller payment dispute, counterfeit items, or private transaction loss.

### 7. Claims procedure
Email **info@omeetso.in** within seven (7) days of the disputed advertising charge with account details, order ID, amount, date and supporting evidence. Never email full card numbers, passwords or OTPs. Omeetso may request reasonable verification. Approved refunds are made to the original payment method where practicable and may take the payment processor's standard settlement timeframe.
    `,
  },
  {
    id: "disclaimer",
    title: "Part IV — Marketplace and Transaction Disclaimer",
    shortTitle: "Marketplace Disclaimer",
    badge: "Zero-Escrow Model",
    description: "Crucial disclaimer on buyer-seller interactions, diligence requirements, and off-platform payments.",
    content: `
Omeetso is a venue for hyperlocal information, discovery and contact. Every buyer and seller contracts independently. Omeetso is not a party to their contract and receives no buyer–seller purchase money under the stated model.

### Mandatory User Responsibilities Before Paying or Delivering
1. **Meet safely and inspect in person:** Meet in public, well-lit places and inspect the item or premises thoroughly before completing the transaction.
2. **Verify seller identity & legal title:** Verify seller identity, ownership, serial numbers, original invoice, vehicle registration, title, encumbrances and necessary permissions.
3. **Regulated goods and services:** For vehicles, property, jobs, financial products, health-related items or regulated services, obtain independent professional and official government verification.
4. **Never share banking secrets:** Never share OTP, PIN, CVV, passwords or remote-screen access (e.g. AnyDesk, TeamViewer).
5. **UPI / QR Code Scam Warning:** **Receiving money never requires scanning a QR code or entering a UPI PIN.** Entering a UPI PIN always debits your account.
6. **Avoid advance deposits:** Avoid paying advance deposits or token amounts to unknown persons, and always verify payment credits directly in your own banking app rather than relying on digital screenshots or SMS alerts.
7. **Use written records:** Use written contracts, signed receipts and delivery records for all material transactions.
8. **Prompt fraud reporting:** Report suspected fraud to your bank / payment provider and cybercrime authorities (e.g., [cybercrime.gov.in](https://cybercrime.gov.in) or dial 1930 in India) without delay.

> **DISCLAIMER:** Any safety guidance, tips or badge provided on Omeetso is informational only and does not transfer responsibility to Omeetso. Omeetso cannot inspect every User or transaction and does not guarantee recovery of private funds.
    `,
  },
  {
    id: "prohibited",
    title: "Part V — Acceptable Use and Prohibited Listings Policy",
    shortTitle: "Prohibited Listings",
    badge: "Strictly Enforced",
    description: "Comprehensive catalogue of prohibited goods, restricted categories, and listing quality standards.",
    content: `
### Absolutely Prohibited Items and Services
The following items, services, and content may never be published, listed, advertised or traded through Omeetso:
- **Stolen property** and goods lacking lawful title or ownership.
- **Illegal drugs, narcotics**, psychotropic substances, prescription-only medicines, and drug paraphernalia.
- **Weapons, firearms, ammunition**, explosives, fireworks, military equipment and restricted defence items.
- **Human organs, body parts**, human trafficking, sexual exploitation, prostitution and unlawful adult services.
- **Child sexual abuse material (CSAM)** or any sexualised content involving minors.
- **Counterfeit goods**, replica branded products, forged documents, fake currency and pirated copyright works.
- **Government IDs, personal databases**, login credentials, bank accounts, pre-activated SIM cards or leaked financial information.
- **Hazardous chemicals**, poisons, illegal pesticides, banned substances, recalled or unsafe consumer products.
- **Protected wildlife**, illegal animal trade, ivory, endangered flora/fauna and products prohibited by wildlife protection laws.
- **Unlawful gambling**, betting, lottery tickets, money-circulation schemes, multi-level marketing (MLM) or deceptive pyramid/investment schemes.
- **Malware, spyware, hacking tools**, phishing kits, keyloggers, and exploit credentials.
- **Discriminatory, hateful, terrorist**, violent, defamatory, obscene, privacy-invasive or threatening content.
- Any item, service or conduct prohibited by Indian law, regulator directions, court orders or Omeetso risk policies.

### Restricted or Verification-Dependent Categories
Omeetso may require licences, age controls, location restrictions, disclosures or prior approval for regulated categories including:
- Vehicles, automobiles and automotive spare parts
- Real estate, rental properties and land listings
- Jobs, employment, internships and recruitment leads
- Financial, loan or insurance leads
- Health products, medical equipment and food products
- Animals and pets compliant with pet shop and breeding regulations
- Event tickets, educational credentials and regulated professional services

Omeetso reserves the right to prohibit any category even if not universally unlawful where platform safety, community health or operational capacity requires it.

### Listing-Quality Rules
- **Single offering:** One genuine offering per listing unless a catalogue feature permits otherwise.
- **Accuracy:** Accurate category, location, price, condition and clear disclosure of material defects.
- **No bait pricing:** No misleading ₹0, ₹1 or unrealistic placeholder prices.
- **No keyword stuffing:** Descriptions must be relevant; no spamming unrelated keywords or brands.
- **No deceptive contact tricks:** No contact details placed in titles or photos to evade platform safety filters.
- **Authentic claims:** No false urgency, guaranteed-income claims, fake discounts or misleading before/after claims.
- **Job listings:** Must identify genuine role, employer/recruiter status, physical work location, compensation basis and fee disclosure. Unlawful recruitment fees and deceptive work-from-home schemes are strictly forbidden.
    `,
  },
  {
    id: "trust-safety",
    title: "Part VI — Trust, Safety and Fraud Prevention Policy",
    shortTitle: "Trust & Safety",
    badge: "Safety Architecture",
    description: "Safety controls, fraud detection signals, and security protocols deployed across the marketplace.",
    content: `
### Safety Controls Omeetso May Deploy
- **Identity & Contact Signals:** Phone and email OTP verification, device and IP risk analysis, rate limits and account security challenges.
- **Moderation Architecture:** Automated and human moderation, duplicate listing detection, image/text matching and scam-pattern heuristics.
- **User Safety Tools:** In-app reporting, user blocking, communication restrictions, account suspension and security reviews.
- **Evidence Preservation & Law Enforcement:** Preservation of audit logs and records; lawful cooperation with banks, cybercrime cells, regulators and police authorities.
- **Educational Warnings:** High-risk category warnings, safety alerts in chat, and delayed publication for unverified listings.

### No Absolute Security Guarantee
These controls represent risk-reduction measures, not an absolute warranty that every User is genuine or that every fraud attempt will be prevented. Fraudsters may use stolen identities, compromised devices, forged invoices or off-platform communications. Users must always exercise independent diligence and caution.

### Reporting Security & Fraud Issues
Report suspicious listings, harassment, impersonation, prohibited goods, intellectual property infringement, account compromise or fraud directly via:
- In-product **"Report Listing"** or **"Report User"** buttons
- Email: **info@omeetso.in** (provide listing URL/ID, user handle, detailed reason, and supporting screenshots)
- For immediate crimes, extortion, or financial theft, report immediately to your local police and the National Cyber Crime Portal at [cybercrime.gov.in](https://cybercrime.gov.in).
    `,
  },
  {
    id: "ip-takedown",
    title: "Part VII — Intellectual Property and Notice-and-Takedown Policy",
    shortTitle: "IP & Notice Takedown",
    badge: "Safe Harbour",
    description: "Procedures for rights holders to report infringement and safe harbour compliance under the IT Act.",
    content: `
### Rights-Owner Infringement Notice
If you believe that your copyright, trademark, design, patent or other proprietary right has been infringed by a listing on Omeetso, you or your authorised agent may email a formal Notice of Infringement to **info@omeetso.in** containing:
1. Full legal name, address, email, telephone number, and proof of authorisation (if acting on behalf of a rights holder).
2. Clear identification of the protected work or registered trademark (including registration certificates).
3. The exact listing URL(s) or Listing ID(s) where the infringing material is published.
4. Specific description of how the listing infringes the intellectual property rights.
5. A good-faith statement that the use is not authorised by the rights holder, its agent, or the law.
6. A statement under penalty of perjury that the information in the notice is accurate and that the complainant is the owner or authorised agent.
7. Physical or electronic signature of the rights holder or authorised representative.

*Incomplete, vague or abusive notices may be rejected.*

### Review, Takedown and Counter-Notice
- **Prompt Review:** Upon receipt of a valid notice complying with Indian intermediary guidelines, Omeetso will expeditiously review the claim, preserve necessary records, and disable access to the infringing listing.
- **Counter-Notice:** The affected listing User may submit a counter-notice with verifiable proof of ownership, valid invoice, reseller authorisation or lawful fair use.
- **Dispute Resolution:** Omeetso does not act as an adjudicatory court. In the event of conflicting genuine claims, Omeetso may keep content disabled and require the parties to submit an order from a court of competent jurisdiction.
- **Repeat Infringers:** Omeetso will terminate accounts of repeat intellectual property infringers.

### Platform Brand & Trademarks
"Omeetso", the Omeetso logos, product names, UI designs, and brand dress are proprietary intellectual property of Digitalness Industries LLP. No person may use Omeetso brand assets, mimic the platform UI, or register confusingly similar domain names without explicit prior written permission.
    `,
  },
  {
    id: "cookies",
    title: "Part VIII — Cookie and Tracking Technologies Policy",
    shortTitle: "Cookie Policy",
    badge: "Tracking & Storage",
    description: "Explanation of cookies, local storage, session identifiers, and how to manage your privacy choices.",
    content: `
### Technologies Used
Omeetso uses cookies, browser local storage, session storage, software development kits (SDKs), pixels and similar technologies to provide, secure, analyze and improve the marketplace.

### Categorisation of Technologies

#### 1. Strictly Necessary (Always Active)
Essential for the platform to function. These include authentication tokens, session management, CSRF security, load balancing, fraud detection, and essential navigation. You cannot turn off strictly necessary cookies.

#### 2. Functional & Preferences
Remember your preferred language, selected city/location, theme preferences, and saved interface filters so you do not need to re-enter them on each visit.

#### 3. Performance & Analytics
Help us understand how visitors interact with Omeetso, discover broken links, measure page load speeds, and improve application responsiveness. Analytics data is aggregated and de-identified where feasible.

#### 4. Advertising & Campaign Measurement
Used to measure the performance, impressions, clicks, and attribution of paid advertising campaigns on Omeetso. Non-essential advertising cookies are subject to your consent and ad preference settings.

### Managing Your Choices
- **In-App Preferences:** You can customize ad personalization and analytics preferences at any time in **Settings → Privacy** or **Settings → Ad Preferences**.
- **Browser & Device Controls:** Most browsers allow you to block or delete cookies through browser settings. Note that disabling essential cookies will prevent logging in and core marketplace features.
    `,
  },
  {
    id: "grievance",
    title: "Part IX — Grievance Redressal and Law-Enforcement Cooperation Policy",
    shortTitle: "Grievance & Law Enforcement",
    badge: "Statutory Redressal",
    description: "Designated Grievance Officer, redressal escalation process, and law enforcement cooperation protocol.",
    content: `
### Designated Grievance Officer
In accordance with the **Information Technology Act, 2000**, the **Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (as updated through 2026)**, and the **Consumer Protection (E-Commerce) Rules, 2020**, the details of the designated Grievance Officer for Omeetso are as follows:

- **Designation:** Grievance Officer
- **Legal Entity:** Digitalness Industries LLP (Operator of Omeetso)
- **Registered Office:** 11/1, Main Road, near Indira Gandhi Statue, Prashanthinagar, Prashanth Nagar, Uppal, Hyderabad, Telangana 500039, India
- **Grievance & Legal Email:** **info@omeetso.in**
- **Effective Hours:** Monday to Friday, 10:00 AM – 6:00 PM IST (excluding statutory public holidays)

### Submitting a Grievance
To lodge a formal grievance regarding content, listing violation, account restriction, impersonation, or privacy concern:
1. Send an email to **info@omeetso.in** with the subject line: \`[Grievance] - <Listing ID / Account / Issue Summary>\`.
2. Provide your full name, registered mobile number/email, detailed description of the grievance, specific listing URLs, and supporting documentary evidence.
3. *Do NOT include passwords, OTPs, or unnecessary banking credentials.*

### Resolution Timeframes
- **Acknowledgment:** Within twenty-four (24) to forty-eight (48) hours of receipt.
- **Urgent Takedown (Sexual/CSAM/Impersonation content):** Processed within twenty-four (24) hours as mandated by intermediary guidelines.
- **General Grievance Disposal:** Within fifteen (15) days of receipt, accompanied by a reasoned response.

### Law-Enforcement and Government Requests
Law enforcement agencies, cybercrime cells, courts, and statutory regulatory authorities may send legal notices, preservation requests (under Section 91 CrPC / Section 94 BNSS or applicable IT Act provisions) and court orders to **info@omeetso.in**.

**Notice Requirements for Law Enforcement:**
- Must originate from an official government email domain (\`.gov.in\`, \`.nic.in\`, or official police department domain).
- Must cite the specific statutory authority, FIR/crime number, target phone/email/listing ID, exact date-range, and scope of data required.
- Emergency requests must explicitly indicate imminent risk of life, bodily harm, or national security threat.
    `,
  },
  {
    id: "community-standards",
    title: "Part X — Community Standards and Enforcement Framework",
    shortTitle: "Community Standards",
    badge: "Code of Conduct",
    description: "Rules for honest, respectful communication, fair trading, and tiered enforcement actions.",
    content: `
### Community Standards
Every user, buyer, seller, and merchant on Omeetso must abide by the following core principles:
1. **Be Truthful and Honest:** Provide accurate item descriptions, genuine product photos, real prices, and truthful condition details. Do not exaggerate or hide defects.
2. **Be Respectful:** Treat fellow community members with courtesy. Zero tolerance for profanity, harassment, intimidation, stalking, hate speech, or discriminatory behavior.
3. **Respect Privacy:** Never publish another person's personal phone number, home address, private photos, or financial details without lawful consent.
4. **No Exploitation or Abuse:** Never exploit vulnerable individuals, minors, or emergency situations.
5. **No Manipulation:** Do not create duplicate spam listings, submit fake reviews, click-bomb advertisements, or operate bot accounts.
6. **Polite Offboarding:** Respect counterparties who decline an offer or terminate a negotiation; cease messaging when requested.

### Enforcement Framework
Omeetso enforces compliance through a proportionate, multi-stage enforcement model based on violation severity, intent, harm, and history:
- **Level 1 — Educational Notice / Warning:** For minor formatting mistakes or first-time accidental policy deviations.
- **Level 2 — Content Removal & De-ranking:** Removal of offending listings and reduced search visibility.
- **Level 3 — Feature Restriction:** Temporary suspension of chat, listing creation, or advertising privileges.
- **Level 4 — Account Suspension / Permanent Termination:** Complete account deactivation and forfeiture of active promotions for serious or repeated breaches.
- **Level 5 — Device / IP Blacklisting & Legal Escalation:** Blocking access across identifiers and referring severe fraud, CSAM, extortion or organized crime to law enforcement authorities.
    `,
  },
  {
    id: "supplemental-terms",
    title: "Part XI — Seller, Business User and Category Supplemental Terms",
    shortTitle: "Category Terms",
    badge: "Specialized Sectors",
    description: "Supplemental terms for commercial merchants, job recruiters, real estate, vehicles, and regulated services.",
    content: `
### 1. Business Sellers, Verified Stores and Merchants
- Business Users and verified store owners must disclose their commercial status, business entity name, GSTIN (where registered), and return/cancellation policies.
- Business Users are solely responsible for issuing valid GST tax invoices, complying with consumer protection laws, honoring warranties, and fulfilling product safety obligations.
- Omeetso hosting a business listing or store page does not make Omeetso a seller, distributor, or guarantor.

### 2. Jobs and Recruitment Listings
- Omeetso is not an employer, recruitment agency, or placement service.
- Employers and recruiters warrant that all posted vacancies represent genuine employment opportunities with lawful wages.
- **Prohibition on Candidate Fees:** Job posters shall **never** demand advance registration fees, training fees, processing fees, security deposits, visa fees, or equipment charges from job seekers.
- Candidate resumes and contact data shared through Omeetso must be handled in strict accordance with data privacy laws.

### 3. Real Estate and Rentals
- Omeetso is not a real-estate agent, broker, builder, or title verifier.
- Property posters must hold lawful title, ownership, or authorized power of attorney to list the property.
- Applicable listings must comply with Real Estate (Regulation and Development) Act (RERA) disclosures.
- Buyers and tenants must independently inspect physical premises, verify encumbrance certificates, check property tax receipts, and execute registered rental/sale deeds.

### 4. Vehicles and Automobiles
- Vehicle sellers must possess valid registration certificate (RC), insurance, pollution under control (PUC) certificate, and lawful authority to sell.
- Sellers must disclose outstanding loans/hypothecation, accident history, chassis/engine number tampering, and pending traffic challans.
- Buyers must independently inspect the mechanical condition, perform RTO ownership transfer, and clear hypothecation before paying consideration.

### 5. Financial, Health and Regulated Services
- No listing on Omeetso constitutes financial, investment, legal, taxation, or medical advice.
- Financial service providers, loan agents, and insurance intermediaries must hold valid RBI / IRDAI / SEBI registrations and state mandated licensing numbers.
- Guaranteed high-return schemes, advance-fee loan offers, and unregistered chit fund solicitations are strictly prohibited.
    `,
  },
  {
    id: "account-deletion",
    title: "Part XII — Consent, Account Deletion and User Requests",
    shortTitle: "Deletion & Consents",
    badge: "User Rights",
    description: "How to delete your account, statutory consent frameworks, and consequences of deactivation.",
    content: `
### Account Deletion Request
You may request the deletion of your Omeetso account at any time via:
- In-App: **Settings → Account → Delete Account**
- Email: Send a deletion request from your registered email address to **info@omeetso.in**.

### Deletion Process and Verification
To protect users against malicious deletion or account takeover, Omeetso will verify account ownership via registered OTP or email confirmation prior to processing deletion.

### Consequences of Account Deletion
- **Public Listings:** All active public listings, store catalogues, and profile cards will be permanently taken down and removed from public search results.
- **Promotions & Credits:** Any active advertising campaigns, remaining wallet credits, or promotional balances will immediately expire and are non-refundable.
- **Delivered Messages:** Messages and chat history already delivered to counterparties will remain in their respective inboxes for their transaction safety records.
- **Lawful Retention:** Omeetso is required by Indian law (including CERT-In cybersecurity directions, IT Intermediary Rules, and tax laws) to retain essential authentication logs, tax invoices, fraud reports, and dispute audit trails for the mandated statutory periods. Such data is archived with restricted access and deleted upon expiry of the statutory retention period.

### Statutory Account & Marketing Consents

#### Mandatory Account Consent
> *"I have read, understood and agree to Omeetso's Terms of Use and Privacy Policy. I acknowledge that Omeetso is a classifieds and advertising intermediary platform, charges strictly for advertising and promotional visibility, and does not hold, collect, escrow or guarantee payments or transactions between buyers and sellers."*

#### Optional Marketing Consent
> *"I agree to receive promotional updates, newsletter highlights, and special advertising offers from Omeetso. I understand I can withdraw this consent at any time via account settings or the unsubscribe link without affecting core account and transactional notices."*
    `,
  },
  {
    id: "statutory-basis",
    title: "Part XIII — Publication, Compliance Checklist and Legal Basis",
    shortTitle: "Compliance & Law",
    badge: "Indian Legal Framework",
    description: "Comprehensive statutory foundation and implementation checklist under applicable Indian laws.",
    content: `
### Indian Legal Framework & References
The Omeetso Legal Documentation Pack has been drafted in strict conformity with applicable Indian legislations, rules, and circulars:
1. **Information Technology Act, 2000:** Section 79 (Intermediary safe-harbour and due diligence), Section 43A, Section 67C (Preservation and retention of records), and Section 69.
2. **Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:** Updated through February 2026, mandating clear terms, prohibited content categories, Grievance Officer details, 24-hr/15-day resolution SLAs, and annual compliance reporting.
3. **Digital Personal Data Protection Act, 2023 (DPDPA) & DPDP Rules, 2025:** Processing based on specific lawful consent or legitimate uses, Data Fiduciary obligations, reasonable security safeguards, breach notification, and Data Principal rights (access, correction, erasure, grievance redressal, nomination).
4. **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011:** To the extent applicable during transition.
5. **Consumer Protection Act, 2019 & Consumer Protection (E-Commerce) Rules, 2020:** Requirements for marketplace intermediaries, disclosure of legal entity, Grievance Officer, seller transparency, and unfair trade practice prohibitions.
6. **Indian Contract Act, 1872:** Principles of valid offer, acceptance, lawful consideration, and capacity to contract.
7. **Bharatiya Nyaya Sanhita, 2023 (BNS):** Protection against fraud, criminal breach of trust, cheating, identity theft, obscenity, and defamation.
8. **CERT-In Directions (April 28, 2022):** Cyber-incident reporting within 6 hours, synchronization of system clocks with NTP, and mandatory maintenance of ICT system and access logs for 180 days.

### Official Regulatory Portals
- Ministry of Electronics and Information Technology: [meity.gov.in](https://www.meity.gov.in)
- Department of Consumer Affairs: [consumeraffairs.nic.in](https://consumeraffairs.nic.in)
- Indian Computer Emergency Response Team: [cert-in.org.in](https://www.cert-in.org.in)
- National Cyber Crime Reporting Portal: [cybercrime.gov.in](https://cybercrime.gov.in)

### Implementation & Compliance Notice
> **IMPORTANT IMPLEMENTATION NOTICE:** This is a business-specific legal documentation pack for Omeetso (operated by Digitalness Industries LLP). Before formal publication and periodic audits, verify the designated individual Grievance Officer details, insert LLPIN/CIN and GSTIN where applicable, and maintain active legal counsel review as intermediary rules and DPDP rule notifications evolve.
    `,
  },
];
