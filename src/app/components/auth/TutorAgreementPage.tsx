import { Link } from "react-router";
import { ShieldCheck, ArrowLeft, AlertTriangle, Scale, DollarSign, BookOpen, Users, Lock, FileText } from "lucide-react";

const sections = [
  {
    number: "1",
    title: "Purpose",
    icon: FileText,
    color: "blue",
    content: `This Agreement defines the terms and conditions under which you (the Tutor) will provide training services to Interns through InternConnect, using the InHub platform.`,
  },
  {
    number: "2",
    title: "Platform Usage (Mandatory)",
    icon: BookOpen,
    color: "indigo",
    content: `All training sessions, materials, and interactions must be conducted exclusively on InHub. As a Tutor, you are required to: Create and maintain an active account on InHub; Upload all course materials and resources onto the platform; Deliver all sessions exclusively via the platform.`,
    warning: "STRICTLY PROHIBITED: Tutors are strictly prohibited from conducting sessions outside InHub, or redirecting Interns to any external platform.",
  },
  {
    number: "3",
    title: "Scope of Services",
    icon: Users,
    color: "violet",
    content: `As a Tutor, you agree to: Deliver structured, high-quality training sessions; Provide relevant learning materials and guidance; Maintain punctuality and professionalism throughout the programme; Actively support Intern development.\n\nInternConnect agrees to: Source and provide Interns for the training programme; Manage all payments and platform infrastructure; Monitor training performance and quality; Facilitate internship and placement opportunities for Interns.`,
  },
  {
    number: "4",
    title: "Payment Structure",
    icon: DollarSign,
    color: "emerald",
    content: null,
    paymentDetails: true,
  },
  {
    number: "5",
    title: "Performance & Quality Accountability",
    icon: ShieldCheck,
    color: "blue",
    content: `Tutors are expected to deliver high-quality, impactful training at all times. InternConnect reserves the right to: Monitor sessions and evaluate training delivery; Collect feedback from Interns; Evaluate programme outcomes.\n\nInternConnect is committed to maintaining training standards and shares responsibility for programme outcomes, including Intern development and overall quality assurance.`,
  },
  {
    number: "6",
    title: "Misconduct",
    icon: AlertTriangle,
    color: "red",
    content: `The following actions constitute misconduct under this Agreement: Repeated lateness or unexplained absence; Abandonment of training sessions; Delivering poor-quality or unstructured training; Fraudulent behaviour or misrepresentation; Harassment, discrimination, or inappropriate behaviour toward Interns; Attempting to bypass the platform for personal gain; Recruiting or redirecting Interns without prior approval.\n\nMisconduct may result in: Reduction or forfeiture of payment; Immediate termination of this Agreement; Possible legal action.`,
  },
  {
    number: "7",
    title: "Availability & Withdrawal Policy",
    icon: Lock,
    color: "amber",
    content: `Pre-Programme Commitment: Tutors must confirm their availability before the programme commences. If unavailable, the Tutor must notify InternConnect at least 7 days before the programme start date.\n\nWithdrawal After Acceptance: Tutors who wish to withdraw after committing to a programme must submit a formal written notice of withdrawal and provide at least 10 days' notice before the effective withdrawal date.\n\nFailure to comply with this policy may result in financial penalties or blacklisting from the platform.`,
  },
  {
    number: "8",
    title: "Intern Management & Control",
    icon: Users,
    color: "indigo",
    content: `InternConnect is solely responsible for sourcing and assigning Interns. Tutors may not take Interns off-platform or offer private sessions outside of InternConnect under any circumstances.`,
  },
  {
    number: "9",
    title: "Recruitment & Talent Selection",
    icon: Users,
    color: "violet",
    content: `Tutors may recommend outstanding Interns for recruitment opportunities. However, Tutors must provide documented justification for any recommendation, and all recruitment decisions require prior written approval from InternConnect.`,
    warning: "STRICTLY PROHIBITED: Tutors are strictly prohibited from recruiting Interns without consent or redirecting Interns to external organisations without prior approval from InternConnect.",
  },
  {
    number: "10",
    title: "Non-Circumvention",
    icon: Lock,
    color: "red",
    content: `The Tutor agrees not to: Bypass InternConnect for payments or training arrangements; Establish direct financial relationships with Interns sourced through the platform.\n\nViolation of this clause will result in: Immediate termination of this Agreement; Forfeiture of all outstanding earnings; Legal consequences.`,
  },
  {
    number: "11",
    title: "Confidentiality",
    icon: Lock,
    color: "blue",
    content: `Both parties agree to keep strictly confidential all information relating to: Intern personal data and records; Platform operations and processes; Financial information; Business strategies.`,
  },
  {
    number: "12",
    title: "Termination",
    icon: AlertTriangle,
    color: "red",
    content: `InternConnect may terminate this Agreement if: The Tutor breaches any terms of this Agreement; Misconduct is observed or substantiated; The Tutor consistently fails to meet performance standards.\n\nTermination may be with immediate effect, depending on the severity of the breach.`,
  },
  {
    number: "13",
    title: "Dispute Resolution",
    icon: Scale,
    color: "blue",
    content: `Any dispute arising from this Agreement shall be resolved through: Internal discussion between both parties in good faith; Formal mediation, if internal discussion does not resolve the matter.`,
  },
  {
    number: "14",
    title: "Nature of Relationship",
    icon: FileText,
    color: "gray",
    content: `This Agreement does not constitute an employment relationship. The Tutor operates solely as an independent contractor.`,
  },
];

export default function TutorAgreementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">InternConnect Tutor Agreement</h1>
          <p className="text-gray-500 text-sm">d-internconnect.com · InHub Training Programme</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-blue-700 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" /> Official Platform Agreement
          </div>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <p className="text-gray-600 text-sm leading-relaxed">
            This Agreement is entered into between <strong>InternConnect</strong>, operating via its platform <strong>InHub</strong> (hereinafter referred to as "the Platform"), and the Tutor signing up on this platform. By accepting during registration, you confirm that you have read, understood, and agreed to all the terms set out below.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.number} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className={`w-8 h-8 rounded-lg bg-${section.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 text-${section.color}-600`} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm">{section.number}. {section.title}</h2>
                </div>
                <div className="px-6 py-5">
                  {section.paymentDetails ? (
                    <div className="space-y-4">
                      {/* Revenue Split Highlight */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                          <p className="text-4xl font-black text-emerald-600">65%</p>
                          <p className="text-emerald-700 text-sm font-bold mt-1">Tutor's Share</p>
                          <p className="text-emerald-600 text-xs mt-1">Of total course revenue</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                          <p className="text-4xl font-black text-blue-600">35%</p>
                          <p className="text-blue-700 text-sm font-bold mt-1">Platform's Share</p>
                          <p className="text-blue-600 text-xs mt-1">InternConnect retains this</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4.1</span>
                          <p><strong>Revenue Share:</strong> InternConnect retains 35% of total revenue. The Tutor receives 65%.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4.2</span>
                          <p><strong>Payment Flow:</strong> All payments are made directly to InternConnect. InternConnect handles all financial disbursements to the Tutor.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4.3</span>
                          <div>
                            <p><strong>Payment Schedule:</strong> Of the Tutor's 65% earnings:</p>
                            <ul className="mt-1 ml-4 space-y-0.5 list-disc text-xs text-gray-600">
                              <li><strong>70%</strong> is disbursed during or before the training period (available for immediate withdrawal)</li>
                              <li><strong>30%</strong> is held back until successful programme completion</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4.4</span>
                          <p><strong>Holdback Clause (30%):</strong> The withheld 30% may be partially or fully forfeited if: the Tutor fails to complete the programme; verified complaints are received from Interns; training quality is poor; or the Tutor breaches any terms.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.content && (
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                      )}
                      {section.warning && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2 text-red-700 text-sm">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                          <p><strong>⚠ {section.warning}</strong></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Agreement Acceptance</h3>
          <p className="text-gray-500 text-sm mb-4">
            By checking "I agree to the InternConnect Tutor Agreement" during registration, you confirm that you have read and agreed to all the terms above.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-200"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
