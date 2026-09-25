"""Seed the Eduglobal database with realistic catalog, users and CRM data.

Run:  python -m app.seed   (from the backend/ directory)
"""
import random
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from .database import Base, SessionLocal, engine
from .models import (
    Application,
    ApplicationEvent,
    BlogPost,
    ChatMessage,
    ContactMessage,
    Country,
    Course,
    Document,
    Enquiry,
    Quote,
    Stat,
    Testimonial,
    Ticket,
    University,
    User,
)

pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def slugify(s: str) -> str:
    return (
        s.lower()
        .replace("&", "and")
        .replace("'", "")
        .replace(",", "")
        .replace(".", "")
        .replace("(", "")
        .replace(")", "")
        .replace("  ", " ")
        .replace(" ", "-")
    )


COUNTRIES = [
    dict(name="United Kingdom", flag="🇬🇧", tagline="One-year Masters. Globally respected degrees.",
         description="The UK blends centuries of academic prestige with one-year Masters programs that get you career-ready faster. Post-study work visas up to 2 years make it a favourite for ambitious graduates.",
         universities_count=95, students_count=6800, visa_success_rate=94, min_tuition=11000, avg_living_cost=1100,
         intakes="Sep, Jan", highlights=["1-year Masters degrees", "2-year post-study work visa", "Graduate Route permits", "Free NHS healthcare for students"],
         hero_gradient="from-blue-700 via-indigo-700 to-purple-600", order_index=1),
    dict(name="Canada", flag="🇨🇦", tagline="Affordable excellence with a clear PR pathway.",
         description="Canada pairs world-class universities with generous post-graduation work permits and one of the friendliest immigration systems anywhere. A top pick for students planning long-term futures.",
         universities_count=80, students_count=5200, visa_success_rate=92, min_tuition=9000, avg_living_cost=850,
         intakes="Sep, Jan, May", highlights=["3-year PGWP up to", "Clear Express Entry PR pathway", "Co-op programs with paid internships", "Among the safest countries globally"],
         hero_gradient="from-red-600 via-rose-600 to-orange-500", order_index=2),
    dict(name="Australia", flag="🇦🇺", tagline="Sunshine, sand and world top-50 universities.",
         description="Australia offers globally ranked universities, up to 4 years of post-study work rights and a lifestyle students fall in love with. Strong industry links mean real placements.",
         universities_count=45, students_count=4100, visa_success_rate=90, min_tuition=14000, avg_living_cost=1000,
         intakes="Feb, Jul", highlights=["Up to 4-6 yr post-study work", "Top 50 ranked universities", "Strong scholarships for internationals", "Part-time work 24 hrs/week"],
         hero_gradient="from-amber-500 via-orange-600 to-rose-500", order_index=3),
    dict(name="United States", flag="🇺🇸", tagline="The home of research, innovation and big dreams.",
         description="From Ivy League halls to STEM OPT extensions, the US remains the world's research powerhouse. Flexible curricula let you design your own degree path.",
         universities_count=180, students_count=7400, visa_success_rate=85, min_tuition=18000, avg_living_cost=1300,
         intakes="Aug, Jan", highlights=["3-yr STEM OPT extension", "Unmatched research funding", "Flexible curriculum design", "Largest alumni networks"],
         hero_gradient="from-blue-600 via-indigo-600 to-red-500", order_index=4),
    dict(name="Germany", flag="🇩🇪", tagline="Tuition-free public universities. Engineering heaven.",
         description="Most German public universities charge zero tuition — you only cover living costs. Add 18-month job-seeker visas and Europe's strongest engineering industry.",
         universities_count=70, students_count=3900, visa_success_rate=88, min_tuition=0, avg_living_cost=850,
         intakes="Sep, Apr", highlights=["€0 tuition at public unis", "18-month job seeker visa", "EU Blue Card pathway", "Automotive & engineering hub"],
         hero_gradient="from-slate-700 via-red-600 to-amber-500", order_index=5),
    dict(name="Ireland", flag="🇮🇪", tagline="Europe's tech capital welcomes graduates.",
         description="Ireland hosts the European HQs of Google, Meta, Apple and Pfizer — with a 2-year stay-back option and English-taught programs everywhere.",
         universities_count=25, students_count=1900, visa_success_rate=91, min_tuition=10000, avg_living_cost=900,
         intakes="Sep, Jan", highlights=["2-yr stay back for Masters", "EU tech-hub internships", "English-taught programs", "1-yr Masters options"],
         hero_gradient="from-emerald-600 via-green-600 to-teal-500", order_index=6),
    dict(name="New Zealand", flag="🇳🇿", tagline="Adventure lifestyle with practical education.",
         description="New Zealand's universities emphasize hands-on learning, and its 3-year post-study work visa plus legendary landscapes make study feel like a dream.",
         universities_count=15, students_count=900, visa_success_rate=89, min_tuition=12000, avg_living_cost=800,
         intakes="Feb, Jul", highlights=["3-yr post-study work visa", "Practical, industry-linked degrees", "Safe and welcoming", "Work while studying"],
         hero_gradient="from-teal-600 via-cyan-600 to-emerald-500", order_index=7),
    dict(name="Netherlands", flag="🇳🇱", tagline="English-taught programs in the heart of Europe.",
         description="The Netherlands offers 2,100+ English-taught programs, an orientation year permit after graduation, and bikes, canals and world design in every city.",
         universities_count=30, students_count=1200, visa_success_rate=93, min_tuition=8000, avg_living_cost=950,
         intakes="Sep, Feb", highlights=["2,100+ English programs", "1-yr orientation year permit", "EU career launchpad", "Innovative teaching style"],
         hero_gradient="from-orange-500 via-amber-500 to-emerald-500", order_index=8),
    dict(name="Singapore", flag="🇸🇬", tagline="Asia's education superpower and global business hub.",
         description="Home to two of the world's top-30 universities, Singapore blends academic excellence with safety, cleanliness and the fastest-growing job market in Asia.",
         universities_count=12, students_count=1500, visa_success_rate=95, min_tuition=15000, avg_living_cost=1100,
         intakes="Aug, Jan", highlights=["NUS & NTU in world top-30", "Safe, clean and hyper-connected", "Asia-Pacific HQ internships", "Employment pass pathway"],
         hero_gradient="from-rose-500 via-red-500 to-orange-500", order_index=9),
    dict(name="France", flag="🇫🇷", tagline="Culture, cuisine and cutting-edge research.",
         description="From the Sorbonne to École Polytechnique, France pairs centuries of academic tradition with generous government subsidies that keep tuition remarkably low.",
         universities_count=40, students_count=2100, visa_success_rate=90, min_tuition=3000, avg_living_cost=1000,
         intakes="Sep, Jan", highlights=["Public unis from €3,000/yr", "5-yr APS stay-back for Masters", "Aerospace & luxury brand capital", "Erasmus exchange network"],
         hero_gradient="from-blue-600 via-indigo-600 to-rose-500", order_index=10),
    dict(name="United Arab Emirates", flag="🇦🇪", tagline="Global branch campuses in the desert skyline.",
         description="Dubai and Abu Dhabi host branch campuses of top universities from the UK, Australia and India — world degrees with tax-free internships and a booming economy.",
         universities_count=20, students_count=1700, visa_success_rate=96, min_tuition=10000, avg_living_cost=1000,
         intakes="Sep, Jan", highlights=["UK/AU degrees at branch campuses", "Tax-free part-time work", "2-yr post-study visa", "Fastest growing Gulf economy"],
         hero_gradient="from-amber-500 via-yellow-500 to-orange-600", order_index=11),
    dict(name="Sweden", flag="🇸🇪", tagline="Innovation, sustainability and work-life balance.",
         description="Sweden invented Spotify and the Nobel Prize. Group-project learning, generous post-study work rights and the world's best work-life balance await.",
         universities_count=18, students_count=800, visa_success_rate=92, min_tuition=9500, avg_living_cost=1000,
         intakes="Aug, Jan", highlights=["1-yr job-seeker permit after study", "Home of Nobel Prize research", "Strong sustainability programs", "English everywhere"],
         hero_gradient="from-sky-500 via-blue-500 to-emerald-400", order_index=12),
]

# name, country, city, rank, founded, type, tuition range, acceptance, programs, gradient, featured
UNIVERSITIES = [
    ("University of Oxford", "united-kingdom", "Oxford", 3, 1096, "Public", 28000, 48000, 17.5, 320, "from-blue-800 to-indigo-900", True),
    ("Imperial College London", "united-kingdom", "London", 6, 1907, "Public", 32000, 45000, 14.0, 260, "from-sky-700 to-blue-900", True),
    ("University College London", "united-kingdom", "London", 9, 1826, "Public", 26000, 42000, 36.0, 440, "from-violet-700 to-purple-900", True),
    ("University of Edinburgh", "united-kingdom", "Edinburgh", 27, 1583, "Public", 22000, 38000, 40.0, 380, "from-emerald-700 to-teal-900", False),
    ("University of Manchester", "united-kingdom", "Manchester", 34, 1824, "Public", 21000, 35000, 56.0, 390, "from-amber-600 to-yellow-700", True),
    ("University of Toronto", "canada", "Toronto", 21, 1827, "Public", 25000, 45000, 43.0, 700, "from-blue-700 to-sky-800", True),
    ("University of British Columbia", "canada", "Vancouver", 34, 1908, "Public", 22000, 40000, 52.0, 620, "from-cyan-600 to-blue-800", True),
    ("McGill University", "canada", "Montreal", 29, 1821, "Public", 18000, 35000, 46.0, 540, "from-red-700 to-rose-900", False),
    ("University of Waterloo", "canada", "Waterloo", 115, 1957, "Public", 17000, 33000, 53.0, 420, "from-yellow-500 to-amber-600", True),
    ("University of Melbourne", "australia", "Melbourne", 14, 1853, "Public", 24000, 45000, 70.0, 480, "from-indigo-700 to-blue-900", True),
    ("Australian National University", "australia", "Canberra", 30, 1946, "Public", 23000, 42000, 65.0, 350, "from-emerald-600 to-cyan-700", False),
    ("University of Sydney", "australia", "Sydney", 19, 1850, "Public", 25000, 46000, 68.0, 500, "from-orange-600 to-red-700", True),
    ("Monash University", "australia", "Melbourne", 37, 1958, "Public", 21000, 40000, 69.0, 460, "from-teal-600 to-emerald-800", False),
    ("MIT", "united-states", "Cambridge", 1, 1861, "Private", 55000, 60000, 6.7, 180, "from-gray-800 to-slate-900", True),
    ("Stanford University", "united-states", "Stanford", 5, 1885, "Private", 56000, 61000, 4.3, 200, "from-red-700 to-rose-900", True),
    ("Harvard University", "united-states", "Cambridge", 4, 1636, "Private", 54000, 59000, 3.6, 220, "from-red-800 to-red-950", True),
    ("University of California Berkeley", "united-states", "Berkeley", 12, 1868, "Public", 32000, 48000, 17.0, 350, "from-blue-800 to-navy-900", True),
    ("Columbia University", "united-states", "New York", 23, 1754, "Private", 52000, 58000, 4.0, 260, "from-sky-700 to-indigo-900", False),
    ("TU Munich", "germany", "Munich", 37, 1868, "Public", 0, 300, 8.0, 180, "from-blue-600 to-sky-700", True),
    ("RWTH Aachen University", "germany", "Aachen", 90, 1870, "Public", 0, 300, 22.0, 160, "from-cyan-600 to-teal-700", True),
    ("Heidelberg University", "germany", "Heidelberg", 87, 1386, "Public", 0, 3000, 38.0, 190, "from-rose-600 to-red-700", False),
    ("Humboldt University Berlin", "germany", "Berlin", 126, 1810, "Public", 0, 300, 30.0, 210, "from-slate-600 to-gray-800", False),
    ("Trinity College Dublin", "ireland", "Dublin", 87, 1592, "Public", 19000, 30000, 32.0, 240, "from-emerald-700 to-green-900", True),
    ("University College Dublin", "ireland", "Dublin", 126, 1854, "Public", 17000, 28000, 45.0, 220, "from-teal-600 to-emerald-700", False),
    ("University of Auckland", "new-zealand", "Auckland", 65, 1883, "Public", 16000, 30000, 55.0, 180, "from-cyan-600 to-blue-700", True),
    ("University of Otago", "new-zealand", "Dunedin", 214, 1869, "Public", 15000, 28000, 60.0, 140, "from-indigo-600 to-violet-800", False),
    ("Delft University of Technology", "netherlands", "Delft", 47, 1842, "Public", 15000, 20000, 48.0, 130, "from-orange-600 to-amber-700", True),
    ("University of Amsterdam", "netherlands", "Amsterdam", 53, 1632, "Public", 14000, 19000, 44.0, 200, "from-red-600 to-orange-700", True),
    ("Eindhoven University of Technology", "netherlands", "Eindhoven", 125, 1956, "Public", 14000, 18000, 50.0, 90, "from-sky-600 to-cyan-700", False),
    ("National University of Singapore", "singapore", "Singapore", 8, 1905, "Public", 25000, 40000, 25.0, 300, "from-red-600 to-rose-800", True),
    ("Nanyang Technological University", "singapore", "Singapore", 26, 1991, "Public", 24000, 38000, 35.0, 260, "from-rose-500 to-red-700", False),
    ("PSB Academy Singapore", "singapore", "Singapore", 400, 1964, "Private", 12000, 18000, 60.0, 120, "from-red-500 to-orange-600", False),
    ("Sorbonne University", "france", "Paris", 46, 1150, "Public", 3500, 6000, 30.0, 280, "from-blue-700 to-indigo-900", True),
    ("École Polytechnique", "france", "Palaiseau", 55, 1794, "Public", 4000, 9000, 22.0, 150, "from-indigo-600 to-blue-900", False),
    ("Université Paris-Saclay", "france", "Paris", 69, 2019, "Public", 3000, 7000, 35.0, 200, "from-sky-600 to-indigo-700", False),
    ("University of Dubai", "united-arab-emirates", "Dubai", 500, 1997, "Private", 11000, 20000, 65.0, 110, "from-amber-500 to-orange-700", True),
    ("University of Wollongong Dubai", "united-arab-emirates", "Dubai", 300, 1993, "Private", 13000, 22000, 60.0, 100, "from-yellow-500 to-amber-700", False),
    ("Khalifa University", "united-arab-emirates", "Abu Dhabi", 183, 2007, "Public", 9000, 15000, 40.0, 90, "from-orange-600 to-red-700", False),
    ("KTH Royal Institute of Technology", "sweden", "Stockholm", 73, 1827, "Public", 11000, 16000, 45.0, 130, "from-sky-500 to-blue-800", True),
    ("Lund University", "sweden", "Lund", 75, 1666, "Public", 10000, 15000, 50.0, 140, "from-cyan-500 to-sky-800", False),
    ("Uppsala University", "sweden", "Uppsala", 105, 1477, "Public", 9500, 14000, 48.0, 120, "from-blue-500 to-indigo-800", False),
]

COURSE_TEMPLATES = [
    ("MSc Computer Science", "Masters", "1-2 Years", 28000, "6.5", "AI, ML, distributed systems with industry capstone"),
    ("MSc Data Science", "Masters", "1-2 Years", 30000, "6.5", "Statistics, deep learning, and big-data engineering"),
    ("MBA", "Masters", "1-2 Years", 38000, "7.0", "Leadership, strategy, finance with live consulting projects"),
    ("MEng Mechanical Engineering", "Masters", "2 Years", 26000, "6.5", "Robotics, thermal systems and advanced manufacturing"),
    ("MSc Cybersecurity", "Masters", "1-2 Years", 27000, "6.5", "Network defense, cryptography and digital forensics"),
    ("BSc Business Analytics", "Bachelors", "3-4 Years", 24000, "6.0", "Data-driven decision making for modern enterprises"),
    ("BEng Civil Engineering", "Bachelors", "4 Years", 23000, "6.0", "Structures, geotechnics and sustainable infrastructure"),
    ("MSc Public Health", "Masters", "1-2 Years", 22000, "6.5", "Epidemiology, health policy and global health systems"),
    ("MSc Finance & Investment", "Masters", "1 Year", 31000, "6.5", "Markets, risk management and corporate finance"),
    ("MA International Relations", "Masters", "1-2 Years", 21000, "7.0", "Diplomacy, global governance and security studies"),
    ("BSc Nursing", "Bachelors", "3-4 Years", 20000, "7.0", "Clinical practice with hospital placements from year one"),
    ("MSc Artificial Intelligence", "Masters", "1-2 Years", 32000, "6.5", "Deep learning, NLP, computer vision and robotics"),
    ("MSc Biotechnology", "Masters", "2 Years", 25000, "6.5", "Genomics, bioinformatics and industrial biotech"),
    ("BBA", "Bachelors", "3-4 Years", 21000, "6.0", "Foundations of management, marketing and entrepreneurship"),
    ("PhD Engineering", "PhD", "3-5 Years", 8000, "7.0", "Fully-funded research with supervisor-matched projects"),
    ("MSc Renewable Energy Systems", "Masters", "1-2 Years", 24000, "6.5", "Solar, wind and hydrogen technologies with lab access"),
    ("MSc Financial Technology (FinTech)", "Masters", "1 Year", 29000, "6.5", "Blockchain, quant trading and digital banking innovation"),
    ("MSc Global Health", "Masters", "1-2 Years", 21000, "6.5", "Pandemic preparedness and international health policy"),
    ("BSc Psychology", "Bachelors", "3 Years", 19000, "6.0", "Cognitive science with research placements"),
    ("MA UX & Product Design", "Masters", "1-2 Years", 23000, "6.0", "Human-centred design studios and portfolio building"),
    ("MSc Supply Chain Management", "Masters", "1 Year", 22000, "6.0", "Logistics analytics for global trade and e-commerce"),
    ("BSc Computer Science", "Bachelors", "3-4 Years", 25000, "6.0", "Programming foundations through AI and systems design"),
    ("MSc Environmental Engineering", "Masters", "2 Years", 23500, "6.5", "Water systems, climate resilience and green infrastructure"),
]

TESTIMONIALS = [
    ("Ananya Sharma", "MSc Data Science", "University of Toronto", "Canada", "Eduglobal turned my dream into an admit letter. From shortlisting to my visa stamp, my counselor replied within hours — even across time zones. I had three offers in hand by February!", "from-pink-500 to-rose-500", True),
    ("Rahul Verma", "MBA", "Imperial College London", "United Kingdom", "The SOP reviews were brutally honest (in the best way). My essays went from good to unforgettable, and I landed a £12,000 scholarship at Imperial.", "from-indigo-500 to-purple-600", True),
    ("Fatima Al Zahra", "MEng Civil Engineering", "TU Munich", "Germany", "I never believed a tuition-free degree was real until my Eduglobal counselor mapped out Germany for me. Zero fees, world-class labs, and I'm interning at BMW.", "from-emerald-500 to-teal-600", True),
    ("Chen Wei", "MSc Artificial Intelligence", "University of Melbourne", "Australia", "The mock visa interviews were harder than the real one! Everything about my application was polished. Melbourne felt like home from week one.", "from-orange-500 to-amber-600", False),
    ("Priya Nair", "MSc Public Health", "University of Edinburgh", "United Kingdom", "As a first-generation student, the process felt terrifying. My counselor broke it into tiny, doable steps. I'm now researching global health policy — my childhood dream.", "from-violet-500 to-fuchsia-600", True),
    ("Daniel Okafor", "MSc Finance", "University of British Columbia", "Canada", "Eduglobal's CRM portal let me track every document and deadline. No panic, no missed emails. Got my UBC offer with a CAD 15k entrance award.", "from-blue-500 to-cyan-600", False),
    ("Ishita Kapoor", "BSc Business Analytics", "University of Amsterdam", "Netherlands", "From the first Zoom call to my Schengen visa, everything took just 4 months. The AI chat even answered my questions at 2 AM!", "from-rose-500 to-orange-500", False),
    ("Mohammed Rahman", "MSc Cybersecurity", "University of Waterloo", "Canada", "The team caught a scholarship deadline I would've missed and fast-tracked my application. Waterloo co-op changed my career trajectory completely.", "from-teal-500 to-emerald-600", False),
    ("Sofia Martinez", "PhD Engineering", "Delft University of Technology", "Netherlands", "They matched me with a supervisor whose research aligned perfectly with mine. Funded PhD, no tuition, and a gorgeous Dutch city. Couldn't ask for more.", "from-sky-500 to-blue-600", False),
    ("Arjun Malhotra", "MSc FinTech", "National University of Singapore", "Singapore", "NUS was a shot in the dark until my counselor showed me exactly how my profile fit. Internship at a Singapore fintech within 3 months of landing.", "from-red-500 to-rose-600", True),
    ("Chloé Dubois", "MA International Relations", "Sorbonne University", "France", "Studying IR in Paris costs less than one semester back home. Eduglobal handled the Campus France process flawlessly — I just had to dream.", "from-indigo-400 to-blue-500", False),
    ("Ahmed Al Mansoori", "MBA", "University of Wollongong Dubai", "United Arab Emirates", "I kept my job in Dubai while earning a globally recognised MBA. The branch-campus model is a game changer and Eduglobal knew every loophole.", "from-amber-400 to-orange-500", False),
    ("Wilhelm Johansson", "MSc Renewable Energy", "KTH Royal Institute of Technology", "Sweden", "Sweden's approach to sustainability is on another planet. My thesis became a job offer at Vattenfall. Tack, Eduglobal!", "from-cyan-400 to-sky-600", True),
    ("Adaeze Okafor", "MSc Public Health", "University College Dublin", "Ireland", "The 2-year stay-back let me take my time finding the right role. Now I work at the HSE helping shape national health programmes.", "from-emerald-400 to-green-600", False),
    ("Ryu Ji-ho", "MSc AI", "University of Edinburgh", "United Kingdom", "Edinburgh's AI institute lives up to the hype. My counselor prepped me for every interview question — even the weird ones.", "from-violet-400 to-purple-600", False),
]

BLOG = [
    ("The 2026 Ultimate Guide to Studying Abroad", "guides", "Everything you need to know — from picking a country and course to visa interviews, packed into one definitive roadmap for 2026 applicants.", "from-blue-600 to-indigo-700", 12),
    ("10 Scholarships International Students Always Miss", "scholarships", "Chevening, DAAD, Australia Awards and seven more life-changing scholarships — plus the exact timelines to apply for each.", "from-amber-500 to-orange-600", 8),
    ("IELTS vs TOEFL vs Duolingo: Which Should You Take?", "exams", "We compare difficulty, cost, acceptance and scoring of the big three English tests so you can pick with confidence.", "from-violet-600 to-purple-700", 6),
    ("How to Write an SOP That Admissions Committees Love", "guides", "Structure, storytelling and the three mistakes that sink 80% of statements of purpose. Includes real before/after examples.", "from-rose-500 to-pink-600", 9),
    ("Germany vs Canada: Which Is Better for Engineering?", "comparisons", "Tuition, job markets, PR pathways and lifestyle — a head-to-head breakdown for engineering aspirants.", "from-teal-500 to-cyan-600", 10),
    ("Student Visa Interview: 25 Real Questions and Answers", "visas", "Consular officers reveal what they actually look for. Prepare smart with our tested answer frameworks.", "from-emerald-500 to-green-600", 11),
    ("Best Cities for International Students in 2026", "guides", "Affordability, safety, part-time jobs and vibe — our counselors rank the world's top student cities.", "from-sky-500 to-blue-600", 7),
    ("From Application to Arrival: A Month-by-Month Timeline", "guides", "Never miss a deadline again. The exact month-by-month plan our counselors use for every student.", "from-indigo-500 to-violet-600", 9),
    ("The Hidden Costs of Studying Abroad (and How to Budget for Them)", "finance", "Visa fees, health insurance, deposits — the real budget checklist most students discover too late.", "from-yellow-500 to-amber-600", 7),
    ("Part-Time Jobs: Rules for Every Popular Destination", "careers", "How many hours you can work in the UK, US, Canada, Australia and Germany — with tips to land roles fast.", "from-lime-500 to-emerald-600", 8),
    ("SOP vs LOR vs CV: Who Says What in Your Application", "guides", "Every document has a job. Learn how they fit together to tell one convincing story about you.", "from-fuchsia-500 to-purple-600", 6),
    ("Inside a Visa Refusal: 7 Reasons Files Fail (and Fixes)", "visas", "Financial proof gaps, weak ties, sloppy forms — counselors dissect real refusal patterns and how we prevent them.", "from-red-500 to-rose-600", 10),
    ("Why STEM OPT Makes the USA a 3-Year Career Launchpad", "careers", "The extension rules, the employers who hire OPT students, and how to plan your American chapter.", "from-sky-500 to-blue-700", 7),
]

STATS = [
    ("Partner Universities", "850", "+", 1),
    ("Students Placed", "12000", "+", 2),
    ("Visa Success Rate", "94", "%", 3),
    ("Countries Covered", "28", "", 4),
    ("Years of Excellence", "18", "", 5),
    ("Scholarships Won", "$25M", "", 6),
]

QUOTES = [
    ("Education is the most powerful weapon which you can use to change the world.", "Nelson Mandela", 1),
    ("The beautiful thing about learning is that no one can take it away from you.", "B.B. King", 2),
    ("An investment in knowledge pays the best interest.", "Benjamin Franklin", 3),
    ("The roots of education are bitter, but the fruit is sweet.", "Aristotle", 4),
    ("Live as if you were to die tomorrow. Learn as if you were to live forever.", "Mahatma Gandhi", 5),
    ("Study abroad is the single most effective experience to gain a global perspective.", "Institute of International Education", 6),
    ("Travel is fatal to prejudice, bigotry, and narrow-mindedness.", "Mark Twain", 7),
    ("The world is a book, and those who do not travel read only one page.", "Saint Augustine", 8),
]

ENQUIRY_SAMPLES = [
    ("Aarav Mehta", "aarav.mehta@gmail.com", "+91 98200 12345", "Canada", "Masters", "Sep 2027", "Interested in MSc Data Science at UBC. What are my scholarship chances with a 3.7 GPA?", "contacted"),
    ("Emma Thompson", "emma.t@outlook.com", "+44 7700 900123", "United Kingdom", "Masters", "Jan 2027", "Looking at one-year MBA programs in London.", "qualified"),
    ("Zhang Min", "zhangmin@qq.com", "+86 138 0013 8000", "Australia", "Bachelors", "Feb 2027", "Wants computer science undergrad, Melbourne or Sydney.", "new"),
    ("Layla Hassan", "layla.h@gmail.com", "+971 50 123 4567", "Germany", "Masters", "Sep 2027", "Mechanical engineering, asked about tuition-free options.", "contacted"),
    ("John Okoro", "john.okoro@yahoo.com", "+234 803 555 0123", "United States", "PhD", "Aug 2027", "Research interests in renewable energy systems.", "new"),
    ("Sara Ali", "sara.ali@gmail.com", "+92 300 555 0199", "Canada", "Masters", "Sep 2027", "Public health programs, wants co-op options.", "converted"),
    ("Karthik Reddy", "karthik.r@gmail.com", "+91 99890 43210", "Ireland", "Masters", "Sep 2027", "Cloud computing, asked about Dublin tech internships.", "contacted"),
    ("Anna Kowalski", "anna.k@wp.pl", "+48 512 345 678", "Netherlands", "Masters", "Feb 2027", "Business analytics at Amsterdam or Delft.", "qualified"),
    ("Yusuf Demir", "yusuf.d@gmail.com", "+90 532 555 0134", "United Kingdom", "Masters", "Jan 2027", "Finance programs in Manchester with placement year.", "closed"),
    ("Mei Ling", "meiling@163.com", "+65 8123 4567", "New Zealand", "Bachelors", "Jul 2027", "Nursing pathway questions.", "new"),
    ("Diego Fernandez", "diego.f@gmail.com", "+34 655 010 203", "United States", "Masters", "Aug 2027", "AI programs, GRE 325, wants top-20.", "qualified"),
    ("Nadia Petrova", "nadia.p@gmail.com", "+7 912 345 6789", "Germany", "Masters", "Apr 2027", "Data science at TU Munich, visa timeline.", "contacted"),
]


def seed():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        # ----- Users -----
        def mk_user(name, email, password, role):
            u = User(name=name, email=email, phone="+1 555 0100", password_hash=pwd.hash(password), role=role)
            db.add(u)
            return u

        admin = mk_user("Eduglobal Admin", "admin@eduglobal.com", "Admin@123", "admin")
        emp1 = mk_user("Priya Counselor", "employee@eduglobal.com", "Employee@123", "employee")
        emp2 = mk_user("James Wilson", "james@eduglobal.com", "Employee@123", "employee")
        emp3 = mk_user("Sofia Reyes", "sofia@eduglobal.com", "Employee@123", "employee")
        students = [
            mk_user("Alex Student", "student@eduglobal.com", "Student@123", "student"),
            mk_user("Riya Kapoor", "riya@example.com", "Student@123", "student"),
            mk_user("Omar Farooq", "omar@example.com", "Student@123", "student"),
            mk_user("Grace Chen", "grace@example.com", "Student@123", "student"),
            mk_user("Tunde Adeyemi", "tunde@example.com", "Student@123", "student"),
            mk_user("Elena Petrova", "elena@example.com", "Student@123", "student"),
        ]
        db.flush()

        # ----- Countries -----
        c_objs = {}
        for cd in COUNTRIES:
            cd = dict(cd)
            cd["slug"] = slugify(cd["name"])
            c = Country(**cd)
            db.add(c)
            c_objs[cd["slug"]] = c
        db.flush()

        # ----- Universities & Courses -----
        u_objs = {}
        for (name, cslug, city, rank, founded, utype, tmin, tmax, acc, programs, gradient, featured) in UNIVERSITIES:
            c = c_objs[cslug]
            u = University(
                name=name, slug=slugify(name), country_id=c.id, city=city, world_rank=rank, founded=founded,
                type=utype, description=f"{name} in {city} is one of {c.name}'s most prestigious institutions, "
                f"welcoming international students across {programs} programs with world-class research and industry links.",
                tuition_min=tmin, tuition_max=tmax, acceptance_rate=acc, programs_count=programs,
                image_gradient=gradient, featured=featured,
            )
            db.add(u)
            u_objs[name] = u
        db.flush()

        rng = random.Random(42)
        for uname, u in u_objs.items():
            picks = rng.sample(COURSE_TEMPLATES, k=rng.randint(4, 6))
            country = db.get(Country, u.country_id)
            for (cname, level, duration, base_fee, ielts, desc) in picks:
                fee = int(base_fee * rng.uniform(0.75, 1.15))
                if country and country.min_tuition == 0:
                    fee = rng.choice([0, 300])
                db.add(Course(
                    university_id=u.id, name=cname, level=level, duration=duration, tuition=fee,
                    currency="USD" if fee > 500 else "EUR",
                    intake=rng.choice(["Sep 2027", "Jan 2027", "Feb 2027", "Aug 2027"]),
                    ielts=ielts, description=desc,
                ))
        db.flush()

        # ----- Testimonials, Blog, Stats -----
        for idx, (n, prog, uni, country, content, grad, feat) in enumerate(TESTIMONIALS):
            db.add(Testimonial(name=n, program=prog, university=uni, country=country, content=content,
                               rating=5, avatar_gradient=grad,
                               avatar_image=f"/avatars/p{(idx % 12) + 1}.jpg", featured=feat))
        now = datetime.now(timezone.utc)
        for i, (title, cat, excerpt, gradient, mins) in enumerate(BLOG):
            content_para = (
                f"{excerpt}\n\nOur senior counselors have guided over 12,000 students through this exact journey, and this guide distills everything "
                "we've learned into practical, actionable advice. Start early: the strongest applications are built 8-12 months before intake.\n\n"
                "## Key takeaways\n\n"
                "- Shortlist 8-10 universities across 2-3 countries to balance ambition and safety\n"
                "- Standardize tests early so nothing blocks your application season\n"
                "- Tailor every SOP — committees can spot a template from a mile away\n"
                "- Track deadlines in a shared calendar with your counselor\n\n"
                "Ready for personalized guidance? Book a free counseling session and we'll build your custom roadmap."
            )
            db.add(BlogPost(title=title, slug=slugify(title), excerpt=excerpt, content=content_para,
                            category=cat.title(), author=rng.choice(["Priya Counselor", "James Wilson", "Eduglobal Team"]),
                            read_minutes=mins, gradient=gradient, created_at=now - timedelta(days=i * 6 + 2)))
        for (label, value, suffix, order) in STATS:
            db.add(Stat(label=label, value=value, suffix=suffix, order_index=order))
        for (text, author, order) in QUOTES:
            db.add(Quote(text=text, author=author, order_index=order))

        # ----- Enquiries (CRM) -----
        emp_cycle = [emp1, emp2, emp3]
        for i, (n, e, ph, ci, lvl, intake, msg, status) in enumerate(ENQUIRY_SAMPLES):
            db.add(Enquiry(
                name=n, email=e, phone=ph, country_interest=ci, level=lvl, intake=intake,
                message=msg, source=rng.choice(["website", "referral", "instagram", "google"]),
                status=status, owner_id=emp_cycle[i % 3].id,
                created_at=now - timedelta(days=rng.randint(1, 45)),
            ))

        # ----- Applications -----
        statuses = ["submitted", "documents", "reviewing", "offer", "visa", "enrolled"]
        app_count = 0
        for si, s in enumerate(students):
            uni_names = rng.sample(list(u_objs.keys()), k=3)
            for ui, uname in enumerate(uni_names):
                u = u_objs[uname]
                course = db.query(Course).filter(Course.university_id == u.id).first()
                if not course:
                    continue
                status = statuses[(si + ui) % len(statuses)]
                counselor = [emp1, emp2, emp3][si % 3]
                a = Application(
                    student_id=s.id, university_id=u.id, course_id=course.id, counselor_id=counselor.id,
                    status=status, created_at=now - timedelta(days=rng.randint(20, 120)),
                )
                db.add(a)
                db.flush()
                db.add(ApplicationEvent(application_id=a.id, label="Application created", detail=course.name, created_at=a.created_at))
                if status != "submitted":
                    db.add(ApplicationEvent(application_id=a.id, label=f"Status → {status}", detail="Counselor update"))
                    for kind in ["Passport", "Transcripts", "IELTS/TOEFL", "SOP", "LOR x2", "Resume", "Bank statement"]:
                        db.add(Document(application_id=a.id, kind=kind,
                                        status="verified" if status in ("offer", "visa", "enrolled") else rng.choice(["received", "verified", "pending"])))
                app_count += 1

        # ----- Tickets & contacts & chat -----
        db.add(Ticket(user_id=students[0].id, subject="Unable to upload transcript PDF",
                      message="The uploader rejects my 4MB transcript. Can I email it instead?",
                      status="open", priority="high"))
        db.add(Ticket(user_id=students[1].id, subject="Scholarship deadline extension?",
                      message="Is the merit scholarship deadline extendable for January intake?",
                      status="resolved", priority="normal",
                      response="Yes — the deadline is extended to the 30th for January-intake applicants."))
        db.add(Ticket(user_id=students[2].id, subject="Change of counselor request",
                      message="I would like to be assigned to a counselor specializing in PhD admissions.",
                      status="pending", priority="normal"))
        db.add(ContactMessage(name="Web Visitor", email="visitor@example.com", subject="Franchise inquiry",
                              message="I run an education agency in Nairobi and would love to discuss partnership opportunities.",
                              created_at=now - timedelta(days=1)))
        db.add(ContactMessage(name="Ishita Roy", email="ishita.r@gmail.com", subject="IELTS waiver question",
                              message="My degree was taught in English. Can I get an IELTS waiver for UK universities?",
                              created_at=now - timedelta(days=3)))
        db.add(ContactMessage(name="Paul Mensah", email="paul.m@gmail.com", subject="Documents in French",
                              message="Are translated documents acceptable for Canadian study permits?",
                              handled=True, created_at=now - timedelta(days=6)))
        db.add(ChatMessage(user_id=students[0].id, role="user", content="What scholarships can I get in Canada?", session_id="seed"))
        db.add(ChatMessage(user_id=students[0].id, role="assistant", content="Canadian universities offer merit awards of 15–40% at our partner schools. With strong academics you could qualify for UBC's International Scholars award!", session_id="seed"))

        db.commit()
        print(f"✅ Seeded: {db.query(User).count()} users · {db.query(Country).count()} countries · "
              f"{db.query(University).count()} universities · {db.query(Course).count()} courses · "
              f"{db.query(Enquiry).count()} enquiries · {db.query(Application).count()} applications · "
              f"{db.query(BlogPost).count()} blog posts · {db.query(Testimonial).count()} testimonials")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
