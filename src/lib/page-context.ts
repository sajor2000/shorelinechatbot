const PAGE_CONTEXTS: Record<string, string> = {
  "/services/cosmetic-dentistry": `The visitor is browsing the Cosmetic Dentistry page.

Cosmetic dentistry at Shoreline Dental focuses on enhancing appearance and confidence. Common concerns patients have: discolored/stained teeth, chipped/cracked/broken teeth, gaps, misshapen or uneven teeth, worn teeth, teeth that appear too small or large.

Available treatments: Dental Bonding, Dental Veneers, Full-Mouth Rehabilitation, Orthodontics (ClearCorrect, Invisalign), Teeth Whitening.

Every plan starts with a consultation where the doctors listen to goals, evaluate oral health, and recommend treatments aligned with the patient's vision.`,

  "/services/cosmetic-dentistry/dental-veneers": `The visitor is browsing the Dental Veneers page.

Veneers are thin, custom-made shells bonded to the front of teeth to improve appearance. Process: (1) Consultation — doctors discuss goals, evaluate oral health, take impressions/photos; (2) Preparation — thin layer of enamel removed, temporary veneers placed; (3) Placement — custom veneers bonded with dental adhesive, fit/color/shape verified.

Benefits: natural-looking, durable, stain-resistant, can address chips, gaps, discoloration, and misshapen teeth in one treatment.`,

  "/services/cosmetic-dentistry/dental-bonding": `The visitor is browsing the Dental Bonding page.

Dental bonding uses tooth-colored composite resin to repair and enhance teeth. It's versatile, affordable, and quick — often completed in under an hour. Addresses chips, cracks, discoloration, and gaps.

Process: composite resin shade matched to natural teeth, tooth surface lightly roughened, conditioning liquid applied, resin molded and shaped, hardened with UV light, then polished. Noninvasive — preserves natural tooth structure. Patients should avoid biting hard objects (ice, pens) to extend lifespan.`,

  "/services/cosmetic-dentistry/teeth-whitening": `The visitor is browsing the Teeth Whitening page.

Two options available:
- In-Office Whitening: Fast, powerful, noticeable results in one visit. Concentrated whitening gel applied, advanced techniques activate bleaching.
- Take-Home Whitening Trays: Custom-fitted trays with professional-grade gel, worn daily for several weeks. Whiten at your own pace.

Dr. Rojas and Dr. Patel provide personalized guidance for both options. Great for removing years of discoloration from coffee, tea, wine, etc.`,

  "/services/cosmetic-dentistry/orthodontics": `The visitor is browsing the Orthodontics page.

Orthodontics corrects misaligned teeth and jaw positions. Benefits: easier to clean teeth (fewer cavities/gum disease), balanced bite prevents excessive wear, relieves TMJ stress, enhances confidence.

Treatment options at Shoreline Dental: ClearCorrect and Invisalign clear aligners. Dr. Rojas and Dr. Patel evaluate dental structure and create a plan fitting the patient's lifestyle and goals.`,

  "/services/cosmetic-dentistry/full-mouth-rehabilitation": `The visitor is browsing the Full-Mouth Rehabilitation page.

Full-mouth rehab is a comprehensive approach for patients with significant dental issues: cracked/chipped/broken teeth, severe wear, missing teeth, advanced gum disease, persistent infections/decay.

May include: Dental Crowns & Bridges, Dental Implants, Dentures, Inlays/Onlays/Fillings, Veneers, Gum Disease Treatment, Root Canal Therapy. Each step works together for both functional and beautiful results. Starts with a comprehensive examination of teeth, gums, and jaw.`,

  "/services/general-family-dentistry": `The visitor is browsing the General & Family Dentistry page.

Services for patients of all ages, from children to seniors. Focus on preventive care: regular checkups and cleanings to prevent cavities and gum disease. Early detection avoids more complex and costly treatments.

Services: Dental Cleanings, Dental Sealants, Emergency Dentistry, Fluoride Treatments, Night Guards, Sleep Apnea Treatment, Sports Mouth Guards. Also offer cosmetic and restorative treatments. Recommend visits every six months.`,

  "/services/general-family-dentistry/dental-cleanings": `The visitor is browsing the Dental Cleanings page.

What's included: plaque and tartar removal, deep cleaning between teeth, polishing to remove surface stains, professional flossing, screening for cavities/gum disease/oral cancer, fluoride treatment, digital X-rays.

Recommended every six months. Professional cleanings support overall health — gum disease and untreated infections increase risk for heart disease and diabetes.`,

  "/services/general-family-dentistry/emergency-dentistry": `The visitor is browsing the Emergency Dentistry page.

Dental emergencies: sudden injury, unexpected dental issue, severe pain, bleeding. Patients should call 312-266-9487 immediately for guidance.

Non-urgent concerns (mild sensitivity, sore gums, minor discomfort) are better addressed during regular hours, but if symptoms worsen, reach out. Dr. Rojas and Dr. Patel prioritize swift, effective care.`,

  "/services/general-family-dentistry/sleep-apnea-treatment": `The visitor is browsing the Sleep Apnea Treatment page.

For mild to moderate obstructive sleep apnea, oral appliance therapy is available. Custom-fitted device repositions the jaw to keep the airway open during sleep. Compact, quiet, easy to use — an alternative to bulky CPAP machines.

Dr. Rojas has additional training in oral sleep appliances. A sleep apnea diagnosis from a physician is required first, then the dental team coordinates care.`,

  "/services/general-family-dentistry/night-guards": `The visitor is browsing the Night Guards page.

Custom night guards protect teeth from bruxism (teeth grinding during sleep). Symptoms: sore jaw, sensitive teeth, headaches/migraines. Untreated bruxism causes tooth wear, chipping, cracking, TMJ disorders.

Process: precise impressions taken, custom guard fabricated, detailed care instructions provided. Fits securely and comfortably.`,

  "/services/general-family-dentistry/dental-sealants": `The visitor is browsing the Dental Sealants page.

Dental sealants are thin protective coatings applied to the chewing surfaces of back teeth (molars) to prevent cavities. Quick, painless, and especially beneficial for children. Part of preventive care.`,

  "/services/general-family-dentistry/fluoride-treatments": `The visitor is browsing the Fluoride Treatments page.

Professional fluoride treatments strengthen enamel and help prevent tooth decay. Quick application during regular cleaning visits. Beneficial for patients of all ages, especially those prone to cavities.`,

  "/services/general-family-dentistry/sports-mouthguards": `The visitor is browsing the Sports Mouth Guards page.

Custom-fitted sports mouth guards protect teeth during athletic activities. Much more effective than store-bought options. Precise fit for comfort and maximum protection.`,

  "/services/oral-surgery": `The visitor is browsing the Oral Surgery page.

Oral surgery addresses complex issues beyond routine care — gums, jaw, and supporting structures. Reasons: tooth extractions, wisdom teeth removal, bone grafting, gum surgery.

Services: All-on-4 Dental Implants, Dental Implants, Implant-Supported Dentures, Tooth Extractions. Dr. Rojas and Dr. Patel prioritize conservative treatment first. If specialized care is needed, they collaborate with trusted oral surgeons.`,

  "/services/oral-surgery/dental-implants": `The visitor is browsing the Dental Implants page.

Dental implants replace missing teeth with a titanium post surgically placed in the jawbone, topped with a custom crown/bridge/denture. Mimics natural tooth structure (root + crown).

Good candidates: one or more missing teeth, sufficient jawbone density, good oral health, no healing-interfering conditions. Bone grafting may be needed if jawbone has weakened.

Process: (1) Titanium post inserted, osseointegration over months; (2) Abutment attached; (3) Custom restoration placed. Implants prevent bone loss and maintain facial structure. Can last decades with proper care.`,

  "/services/oral-surgery/all-on-4-dental-implants": `The visitor is browsing the All-on-4 Dental Implants page.

All-on-4 uses just four strategically placed implants to anchor a full-arch denture. Benefits: fewer implants than traditional full-arch restoration, less invasive, more affordable. Denture can often be secured same day.

Greater stability than traditional dentures, preserves jawbone density. Existing dentures may be retrofitted. Often eliminates need for bone grafts.`,

  "/services/oral-surgery/implant-supported-dentures": `The visitor is browsing the Implant-Supported Dentures page.

Implant-supported dentures attach to dental implants fused with the jawbone — no adhesives or suction needed. Prevents slipping and discomfort. Requires 4-6 implants typically.

Requirements: healthy gums, strong jawbone, good oral hygiene. Process: implants placed surgically, healing period for osseointegration, then custom denture attached. Far more stable than traditional dentures.`,

  "/services/oral-surgery/tooth-extractions": `The visitor is browsing the Tooth Extractions page.

Extractions for teeth damaged beyond repair or threatening oral health. Types: Simple extraction (visible tooth, minimal recovery) and Surgical extraction (broken/impacted teeth, removed in sections).

Aftercare: avoid vigorous rinsing, smoking, straws for first few days. Soft foods recommended. Swelling/mild discomfort normal for a few days. Replacement options include implants, bridges, and dentures.`,

  "/services/restorative-dentistry": `The visitor is browsing the Restorative Dentistry page.

Restorative dentistry rebuilds and repairs damaged, decayed, or missing teeth. Services: Dental Bridges, Dental Crowns, Dental Fillings, Dental Inlays & Onlays, Dentures, Gum Disease Treatment, Root Canal Treatments, Scaling & Root Planing.

Materials blend with natural teeth for natural-looking results. Treatment plans designed for both aesthetics and functionality.`,

  "/services/restorative-dentistry/dental-crowns": `The visitor is browsing the Dental Crowns page.

Crowns restore teeth too damaged for fillings. Needed for: decay/large filling, post-root canal protection, fractures, implant completion, misshapen/discolored teeth.

Process: Two visits. (1) Decay removed, tooth shaped, impression taken, temporary crown placed; (2) Permanent crown fitted and bonded. Custom-matched to natural teeth in size, shape, and color. Care: brush/floss normally, avoid chewing hard objects.`,

  "/services/restorative-dentistry/dental-fillings": `The visitor is browsing the Dental Fillings page.

Composite (tooth-colored) fillings for minor to moderate tooth damage from decay, fractures, or chipping. Blend seamlessly with natural teeth.

Process: One visit. Examine tooth, remove decay, place and shape composite resin, cure with light, polish. Benefits: restore structure, prevent further decay, aesthetic appeal, strong bond with natural tooth. Last many years with proper care.`,

  "/services/restorative-dentistry/root-canal-treatments": `The visitor is browsing the Root Canal Treatments page.

Root canal saves natural teeth from severe damage or infection. Signs: severe pain, sensitivity, swelling, discoloration of tooth.

Process: area numbed, infected pulp removed, interior cleaned/disinfected, filled and sealed, usually followed by a dental crown. Eliminates infection and preserves the natural tooth.`,

  "/services/restorative-dentistry/dentures": `The visitor is browsing the Dentures page.

Dentures replace multiple missing teeth — partial (some teeth) or full (entire arch). Restore function, aesthetics, and facial shape. Types available: conventional, immediate, and implant-supported.

Care: clean daily with soft brush and nonabrasive cleaner, brush gums/tongue/palate each morning, regular dental visits for condition checks.`,

  "/services/restorative-dentistry/gum-disease-treatment": `The visitor is browsing the Gum Disease Treatment page.

Gum (periodontal) disease is progressive — from plaque buildup to infection, inflammation, and bone loss. Symptoms: red/swollen gums, bleeding when brushing, bad breath, receding gums, loose teeth.

Treatment available at Shoreline Dental. Prevention: brushing twice daily, flossing, antimicrobial mouthwash, regular professional cleanings. Early treatment is critical.`,

  "/services/restorative-dentistry/dental-inlays-onlays": `The visitor is browsing the Dental Inlays & Onlays page.

Inlays and onlays are indirect restorations for moderate tooth damage — more than a filling but less than a crown. Custom-made to fit precisely. Preserve more natural tooth structure than crowns.`,

  "/services/restorative-dentistry/dental-bridges": `The visitor is browsing the Dental Bridges page.

Dental bridges replace one or more missing teeth by anchoring to adjacent natural teeth or implants. Restore ability to chew, speak, and maintain facial structure. Custom-matched to natural teeth.`,

  "/services/restorative-dentistry/scaling-root-planing": `The visitor is browsing the Scaling & Root Planing page.

Deep cleaning procedure for gum disease. Scaling removes plaque and tartar below the gumline. Root planing smooths tooth roots so gums can reattach. Often the first line of treatment for periodontal disease.`,

  "/about": `The visitor is browsing the About page. They may be interested in learning about the practice, its values, or the team.`,

  "/about/meet-our-team": `The visitor is browsing the Meet Our Team page.

Dr. Mollie Rojas — General and cosmetic dentistry, clear aligner therapy (Invisalign), oral sleep appliances for sleep apnea. Published researcher on oral cancer. Emphasizes patient education and comprehensive treatment plans. Caring and gentle.

Dr. Sonal Patel, DMD — Comprehensive treatment planning, patient comfort and confidence. Years of experience, customized care.

Kathryn — Dental Hygienist, graduated from Parkland College (4.0 GPA), passionate about healthy smiles and patient comfort.

Anel — Business Administrator.`,

  "/about/office-tour": `The visitor is browsing the Office Tour page. They're interested in seeing the practice space. The office is at 737 North Michigan Avenue, Suite 910 — on the Magnificent Mile in Chicago.`,

  "/contact": `The visitor is on the Contact page. They are likely ready to reach out. Phone: 312-266-9487. Address: 737 North Michigan Avenue, Suite 910, Chicago, IL 60611. Entrance off Chicago Avenue at the corner of Chicago & Michigan.`,

  "/contact-us": `The visitor is on the Contact Us page. They are likely ready to reach out. Phone: 312-266-9487. Address: 737 North Michigan Avenue, Suite 910, Chicago, IL 60611. Entrance off Chicago Avenue at the corner of Chicago & Michigan.`,

  "/patient-resources/financial-options": `The visitor is browsing the Financial Options page. They care about cost and payment.

Options: $0 cleanings for most insured patients. New Patient Special: $99 (cleaning, X-rays, exam, fluoride) for uninsured patients. Cherry Financing: spread cost over months to a year. Dental Assistance Savings Plan (DASP): in-house discount plan for uninsured — 15% off orthodontics, periodontal treatment, and whitening. Online payments via CardPointe.

DASP rules: not insurance, cannot combine with other plans, non-refundable, payment due day of service. $50 broken appointment fee without 24-hour notice.`,

  "/patient-resources/special-offers": `The visitor is browsing the Special Offers page. They're looking for deals.

New Patient Special: $99 for uninsured patients — includes dental cleaning, X-rays, exam with Dr. Rojas or Dr. Patel, and fluoride treatment. Not valid for insured patients. $0 cleanings available for most insured patients — call 312-266-9487 for details.`,

  "/patient-resources/reviews": `The visitor is browsing the Reviews page. They're evaluating the practice based on other patients' experiences. The practice prides itself on personalized, high-end care where every patient is treated as an individual.`,

  "/patient-resources/gallery": `The visitor is browsing the Gallery page. They're looking at before/after photos and results. The practice offers cosmetic and restorative work including veneers, bonding, whitening, implants, and full-mouth rehabilitation.`,
};

export function getPageContext(pageUrl: string | undefined | null): string | null {
  if (!pageUrl) return null;

  let path: string;
  try {
    const url = new URL(pageUrl, "https://www.shorelinedentalchicago.com");
    path = url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    path = pageUrl.replace(/\/+$/, "") || "/";
  }

  if (PAGE_CONTEXTS[path]) return PAGE_CONTEXTS[path];

  const prefix = path.split("/").slice(0, -1).join("/");
  if (prefix && PAGE_CONTEXTS[prefix]) return PAGE_CONTEXTS[prefix];

  return null;
}
