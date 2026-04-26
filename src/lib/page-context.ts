const PAGE_CONTEXTS: Record<string, string> = {
  "/": `The visitor is on the homepage.

They may be exploring Shoreline Dental for the first time. They could be interested in any of the practice's services, scheduling an appointment, or learning about the team.

Greet them warmly and offer to help with whatever brought them to the site.`,

  "/services": `The visitor is browsing the Services page.

This page lists all services offered by the practice across cosmetic, general, restorative, and oral surgery categories. The visitor may be exploring options or looking for a specific service.

Offer to answer questions about any service or connect them with the team to schedule a consultation.`,

  "/services/cosmetic-dentistry": `The visitor is browsing the Cosmetic Dentistry page.

Cosmetic dentistry focuses on enhancing the appearance of teeth and smiles. Shoreline Dental offers several cosmetic services — visitors on this page are likely exploring their options or considering a consultation.

Offer to connect them with the team to discuss their goals or schedule a visit.`,

  "/services/cosmetic-dentistry/dental-veneers": `The visitor is browsing the Dental Veneers page.

Dental veneers are thin, custom-made shells bonded to the front of teeth to improve their appearance. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling a consultation or learning about next steps.

Offer to connect them with the team to discuss their goals or schedule a visit.`,

  "/services/cosmetic-dentistry/dental-bonding": `The visitor is browsing the Dental Bonding page.

Dental bonding is a cosmetic procedure that uses tooth-colored composite resin to repair or enhance the appearance of teeth. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling a consultation or getting more details.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/cosmetic-dentistry/teeth-whitening": `The visitor is browsing the Teeth Whitening page.

Teeth whitening is a cosmetic treatment that lightens the shade of natural teeth. Shoreline Dental offers both in-office and take-home whitening options — visitors on this page are likely interested in learning which option might work for them.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/cosmetic-dentistry/orthodontics": `The visitor is browsing the Orthodontics page.

Orthodontics corrects the alignment of teeth and bite. Shoreline Dental offers clear aligner therapy including ClearCorrect and Invisalign — visitors on this page are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/cosmetic-dentistry/full-mouth-rehabilitation": `The visitor is browsing the Full-Mouth Rehabilitation page.

Full-mouth rehabilitation is a comprehensive treatment approach that addresses multiple dental concerns together for both function and appearance. Shoreline Dental offers this service — visitors on this page likely have significant dental needs and are considering a consultation.

Offer to connect them with the team to discuss their situation or schedule a comprehensive evaluation.`,

  "/services/general-family-dentistry": `The visitor is browsing the General & Family Dentistry page.

General and family dentistry covers preventive and routine dental care for patients of all ages. Shoreline Dental provides a full range of general services — visitors on this page are likely looking to schedule a cleaning, checkup, or learn about available care.

Offer to connect them with the team to schedule an appointment or answer questions.`,

  "/services/general-family-dentistry/dental-cleanings": `The visitor is browsing the Dental Cleanings page.

A dental cleaning is a professional preventive service that helps maintain oral health. Shoreline Dental offers routine cleanings — visitors on this page are likely ready to schedule their next appointment.

Offer to help them book a cleaning or connect them with the team.`,

  "/services/general-family-dentistry/emergency-dentistry": `The visitor is browsing the Emergency Dentistry page.

Emergency dentistry provides urgent dental care when unexpected issues arise. Shoreline Dental prioritizes emergency patients — visitors on this page may need immediate help.

If they describe an emergency, express concern and encourage them to call the office right away.`,

  "/services/general-family-dentistry/sleep-apnea-treatment": `The visitor is browsing the Sleep Apnea Treatment page.

Oral appliance therapy is a dental approach to managing mild to moderate obstructive sleep apnea. Shoreline Dental offers this service — visitors on this page are likely interested in learning more or scheduling a consultation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/general-family-dentistry/night-guards": `The visitor is browsing the Night Guards page.

A night guard is a custom-fitted oral appliance worn during sleep to protect teeth from grinding and clenching. Shoreline Dental offers custom night guards — visitors on this page are likely interested in getting one or learning more.

Offer to connect them with the team to discuss their needs or schedule a visit.`,

  "/services/general-family-dentistry/dental-sealants": `The visitor is browsing the Dental Sealants page.

Dental sealants are thin protective coatings applied to the chewing surfaces of back teeth to help prevent cavities. Shoreline Dental offers this service as part of preventive care — visitors on this page are likely interested in scheduling an appointment.

Offer to connect them with the team to schedule a visit.`,

  "/services/general-family-dentistry/fluoride-treatments": `The visitor is browsing the Fluoride Treatments page.

Fluoride treatments are a quick preventive service applied during regular dental visits to help protect teeth from decay. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling an appointment.

Offer to connect them with the team to schedule a visit.`,

  "/services/general-family-dentistry/sports-mouthguards": `The visitor is browsing the Sports Mouth Guards page.

Custom sports mouth guards are professionally fitted oral appliances that protect teeth during athletic activities. Shoreline Dental offers custom-fitted guards — visitors on this page are likely interested in getting one made.

Offer to connect them with the team to schedule a fitting.`,

  "/services/oral-surgery": `The visitor is browsing the Oral Surgery page.

Oral surgery encompasses dental procedures that address the teeth, gums, jaw, and supporting structures beyond routine care. Shoreline Dental offers several oral surgery services — visitors on this page are likely exploring their options or considering a consultation.

Offer to connect them with the team to discuss their needs or schedule a visit.`,

  "/services/oral-surgery/dental-implants": `The visitor is browsing the Dental Implants page.

A dental implant is a permanent tooth replacement that uses a small post placed in the jawbone to support a custom crown, bridge, or denture. Shoreline Dental offers dental implants — visitors on this page are likely interested in scheduling a consultation to discuss their situation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/oral-surgery/all-on-4-dental-implants": `The visitor is browsing the All-on-4 Dental Implants page.

All-on-4 is a full-arch tooth replacement method that uses four strategically placed implants to support a complete set of teeth. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/oral-surgery/implant-supported-dentures": `The visitor is browsing the Implant-Supported Dentures page.

Implant-supported dentures are dentures that attach to dental implants placed in the jawbone for added stability. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/oral-surgery/tooth-extractions": `The visitor is browsing the Tooth Extractions page.

A tooth extraction is the removal of a tooth that is damaged, decayed, or otherwise needs to be taken out. Shoreline Dental offers both simple and surgical extractions — visitors on this page are likely interested in scheduling a consultation or understanding next steps.

Offer to connect them with the team to discuss their situation or schedule a visit.`,

  "/services/restorative-dentistry": `The visitor is browsing the Restorative Dentistry page.

Restorative dentistry focuses on repairing and rebuilding damaged, decayed, or missing teeth. Shoreline Dental offers a full range of restorative services — visitors on this page are likely exploring their options or considering a consultation.

Offer to connect them with the team to discuss their needs or schedule a visit.`,

  "/services/restorative-dentistry/dental-crowns": `The visitor is browsing the Dental Crowns page.

A dental crown is a custom-fitted cap placed over a damaged tooth to restore its shape, strength, and appearance. Shoreline Dental offers dental crowns — visitors on this page are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their needs or schedule a visit.`,

  "/services/restorative-dentistry/dental-fillings": `The visitor is browsing the Dental Fillings page.

A dental filling restores a tooth that has been affected by decay or minor damage using tooth-colored composite material. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling an appointment.

Offer to connect them with the team to schedule a visit.`,

  "/services/restorative-dentistry/root-canal-treatments": `The visitor is browsing the Root Canal Treatments page.

Root canal therapy is a procedure that treats infection or damage inside a tooth to save the natural tooth from extraction. Shoreline Dental offers this service — visitors on this page may be experiencing discomfort and are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their situation or schedule a visit.`,

  "/services/restorative-dentistry/dentures": `The visitor is browsing the Dentures page.

Dentures are removable replacements for missing teeth that restore function and appearance. Shoreline Dental offers several denture options — visitors on this page are likely interested in scheduling a consultation to discuss what might work for them.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/restorative-dentistry/gum-disease-treatment": `The visitor is browsing the Gum Disease Treatment page.

Gum disease treatment addresses infections and inflammation of the gums and supporting structures of the teeth. Shoreline Dental offers this service — visitors on this page are likely concerned about their gum health and interested in scheduling an evaluation.

Offer to connect them with the team to discuss their concerns or schedule a visit.`,

  "/services/restorative-dentistry/dental-inlays-onlays": `The visitor is browsing the Dental Inlays & Onlays page.

Inlays and onlays are custom-made restorations used to repair moderate tooth damage. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/restorative-dentistry/dental-bridges": `The visitor is browsing the Dental Bridges page.

A dental bridge is a fixed restoration that replaces one or more missing teeth by anchoring to adjacent teeth or implants. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling a consultation.

Offer to connect them with the team to discuss their options or schedule a visit.`,

  "/services/restorative-dentistry/scaling-root-planing": `The visitor is browsing the Scaling & Root Planing page.

Scaling and root planing is a deep cleaning procedure used to treat gum disease. Shoreline Dental offers this service — visitors on this page are likely interested in scheduling an appointment or learning about next steps.

Offer to connect them with the team to discuss their needs or schedule a visit.`,

  "/about": `The visitor is browsing the About page.

They are likely interested in learning about Shoreline Dental, its values, or the team. Visitors on this page may be evaluating the practice before booking.

Offer to answer any questions or connect them with the team to schedule a visit.`,

  "/about/meet-our-team": `The visitor is browsing the Meet Our Team page.

They are interested in learning about the doctors and staff at Shoreline Dental. Visitors on this page are likely evaluating the practice or looking for a provider they feel comfortable with.

Offer to answer questions about the team or connect them with the office to schedule a visit.`,

  "/about/office-tour": `The visitor is browsing the Office Tour page.

They are interested in seeing the practice space and getting a sense of the environment. Visitors on this page may be considering their first visit.

Offer to answer questions about the office or help them schedule an appointment.`,

  "/contact": `The visitor is on the Contact page.

They are likely ready to reach out to the practice. This visitor has high intent — they may want to schedule an appointment, ask a question, or get directions.

Offer to help them with whatever they need or collect their information for the team to follow up.`,

  "/contact-us": `The visitor is on the Contact Us page.

They are likely ready to reach out to the practice. This visitor has high intent — they may want to schedule an appointment, ask a question, or get directions.

Offer to help them with whatever they need or collect their information for the team to follow up.`,

  "/patient-resources": `The visitor is browsing the Patient Resources page.

This page provides access to financial options, special offers, patient reviews, and the smile gallery. The visitor is likely looking for practical information about cost, payment, or the patient experience.

Offer to help them find what they need or connect them with the front desk.`,

  "/patient-resources/financial-options": `The visitor is browsing the Financial Options page.

They are interested in cost, payment plans, or insurance. Shoreline Dental offers several financial options including a New Patient Special ($99 for uninsured patients), Cherry Financing, and the Dental Assistance Savings Plan (DASP) for uninsured patients.

Visitors on this page likely have questions about cost — offer to connect them with the front desk to discuss their specific situation or collect their information for follow-up.`,

  "/patient-resources/special-offers": `The visitor is browsing the Special Offers page.

They are looking for deals or promotions. Shoreline Dental offers a New Patient Special ($99 for uninsured patients, includes cleaning, X-rays, exam, and fluoride) and $0 cleanings for most insured patients.

Offer to help them take advantage of these offers or collect their information to get started.`,

  "/patient-resources/reviews": `The visitor is browsing the Reviews page.

They are evaluating the practice based on other patients' experiences. This visitor may be close to booking but wants social proof first.

Offer to answer any questions or help them schedule an appointment.`,

  "/patient-resources/gallery": `The visitor is browsing the Gallery page.

They are looking at before-and-after photos and results. This visitor is likely interested in cosmetic or restorative work and is evaluating what the practice can do.

Offer to connect them with the team to discuss their goals or schedule a consultation.`,
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
