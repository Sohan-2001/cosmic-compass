
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image'; // Import NextImage
import { ChevronLeft, BookOpen, Sparkles, Sun, Moon, Home as HomeIcon, Hand, AlignStartVertical } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const zodiacSigns = [
  { name: "Aries", symbol: "♈", traits: "Energetic, pioneering, courageous" },
  { name: "Taurus", symbol: "♉", traits: "Patient, reliable, warmhearted" },
  { name: "Gemini", symbol: "♊", traits: "Adaptable, witty, intellectual" },
  { name: "Cancer", symbol: "♋", traits: "Emotional, loving, intuitive" },
  { name: "Leo", symbol: "♌", traits: "Generous, creative, faithful" },
  { name: "Virgo", symbol: "♍", traits: "Modest, practical, analytical" },
  { name: "Libra", symbol: "♎", traits: "Diplomatic, urbane, idealistic" },
  { name: "Scorpio", symbol: "♏", traits: "Determined, passionate, magnetic" },
  { name: "Sagittarius", symbol: "♐", traits: "Optimistic, jovial, honest" },
  { name: "Capricorn", symbol: "♑", traits: "Prudent, ambitious, disciplined" },
  { name: "Aquarius", symbol: "♒", traits: "Independent, inventive, humanitarian" },
  { name: "Pisces", symbol: "♓", traits: "Imaginative, compassionate, sensitive" },
];

const planets = [
  { name: "Sun", symbol: "☉", keywords: "Self, ego, vitality, core identity" },
  { name: "Moon", symbol: "☽", keywords: "Emotions, instincts, subconscious, habits" },
  { name: "Mercury", symbol: "☿", keywords: "Communication, intellect, reason, mindset" },
  { name: "Venus", symbol: "♀", keywords: "Love, beauty, art, harmony, relationships" },
  { name: "Mars", symbol: "♂", keywords: "Action, desire, energy, aggression, courage" },
  { name: "Jupiter", symbol: "♃", keywords: "Expansion, luck, wisdom, optimism, abundance" },
  { name: "Saturn", symbol: "♄", keywords: "Structure, discipline, lessons, responsibility, limits" },
];

const majorPalmLines = [
    { name: "Heart Line", description: "Relates to emotions, love life, and relationships. It can indicate emotional stability and romantic perspectives." },
    { name: "Head Line", description: "Represents intellect, learning style, communication, and knowledge. It shows how you approach thoughts and ideas." },
    { name: "Life Line", description: "Indicates vitality, physical health, and major life changes. It doesn't predict lifespan but reflects life's journey and energy levels." },
    { name: "Fate Line (Destiny Line)", description: "Not everyone has a clear Fate Line. It points to the degree to which life events outside your control affect your life path and career." },
];

export default function AstroLearningPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-headline text-accent mb-4 flex items-center justify-center">
            <BookOpen className="mr-3 h-10 w-10" />
            Learning Hub
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Deepen your understanding of astrology and palmistry with these foundational concepts.
          </p>
        </div>

        <h3 className="text-3xl font-headline text-primary mb-6 text-center">Astrology Basics</h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <Sparkles className="mr-2 h-6 w-6" /> What is Astrology?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 space-y-3">
              <p>
                Astrology is an ancient practice that studies the movements and relative positions of celestial objects as a means for divining information about human affairs and terrestrial events.
              </p>
              <p>
                It's based on the idea that the positions of the stars and planets at the time of a person's birth can influence their personality, characteristics, and life path. A key tool in astrology is the birth chart (or natal chart), which is a snapshot of the heavens at the moment of birth.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <Sun className="mr-2 h-6 w-6" /> The Zodiac Signs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80">
              <p className="mb-4">The zodiac is divided into 12 signs, each associated with specific personality traits and characteristics. Your "sun sign" is determined by the zodiac sign the Sun was in at your time of birth.</p>
              <Accordion type="single" collapsible className="w-full">
                {zodiacSigns.slice(0, 4).map((sign, index) => ( 
                  <AccordionItem value={`item-${index + 1}`} key={sign.name}>
                    <AccordionTrigger className="text-foreground/90 font-medium">{sign.symbol} {sign.name}</AccordionTrigger>
                    <AccordionContent>{sign.traits}</AccordionContent>
                  </AccordionItem>
                ))}
                <AccordionItem value="item-more">
                  <AccordionTrigger className="text-foreground/90 font-medium">And more...</AccordionTrigger>
                  <AccordionContent>The other signs include Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces, each with their own unique qualities.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <Moon className="mr-2 h-6 w-6" /> The Planets
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80">
              <p className="mb-4">In astrology, each planet (including the Sun and Moon, often referred to as "luminaries") represents different facets of life and personality.</p>
               <Accordion type="single" collapsible className="w-full">
                {planets.map((planet, index) => (
                  <AccordionItem value={`planet-${index + 1}`} key={planet.name}>
                    <AccordionTrigger className="text-foreground/90 font-medium">{planet.symbol} {planet.name}</AccordionTrigger>
                    <AccordionContent>{planet.keywords}</AccordionContent>
                  </AccordionItem>
                ))}
                 <AccordionItem value="planet-outer">
                  <AccordionTrigger className="text-foreground/90 font-medium">Outer Planets</AccordionTrigger>
                  <AccordionContent>Uranus, Neptune, and Pluto are slower-moving outer planets, often influencing generational trends and deeper, transformative themes.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <HomeIcon className="mr-2 h-6 w-6" /> The Astrological Houses
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 space-y-3">
              <p>
                The birth chart is divided into 12 houses. Each house represents a different area of life, such as self, possessions, communication, home, creativity, work, relationships, transformation, philosophy, career, community, and spirituality.
              </p>
              <p>
                The planets' placements in these houses at the time of birth show where their energies are most likely to manifest in an individual's life.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="house-1">
                  <AccordionTrigger className="text-foreground/90 font-medium">1st House (Ascendant)</AccordionTrigger>
                  <AccordionContent>Represents self, appearance, first impressions, and your approach to life.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="house-7">
                  <AccordionTrigger className="text-foreground/90 font-medium">7th House (Descendant)</AccordionTrigger>
                  <AccordionContent>Relates to partnerships, marriage, contracts, and one-on-one relationships.</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="house-10">
                  <AccordionTrigger className="text-foreground/90 font-medium">10th House (Midheaven)</AccordionTrigger>
                  <AccordionContent>Governs career, public image, reputation, and life's ambitions.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-3xl font-headline text-primary my-10 text-center">Palmistry Basics</h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <Hand className="mr-2 h-6 w-6" /> What is Palmistry?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 space-y-3">
              <p>
                Palmistry, also known as chiromancy, is the art of characterization and foretelling the future through the study of the palm. It involves examining the lines, mounts (fleshy bumps), and shapes of the hands and fingers.
              </p>
              <p>
                Different features are believed to correspond to various aspects of a person's personality, life path, strengths, and weaknesses. While interpretations can vary, palmistry offers a unique lens for self-reflection.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <AlignStartVertical className="mr-2 h-6 w-6" /> The Major Lines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80">
              <p className="mb-4">The most prominent features in palmistry are the major lines. Here are a few key ones:</p>
              <Accordion type="single" collapsible className="w-full">
                {majorPalmLines.map((line, index) => (
                  <AccordionItem value={`palm-line-${index + 1}`} key={line.name}>
                    <AccordionTrigger className="text-foreground/90 font-medium">{line.name}</AccordionTrigger>
                    <AccordionContent>{line.description}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="my-6 flex justify-center">
                <Image 
                  src="/palm-reading-lines-right-hand_694796-334.png" 
                  alt="Diagram of major palm lines" 
                  width={350} 
                  height={474} // Adjusted to a more common aspect ratio for a palm image
                  className="rounded-md border border-border shadow-lg"
                  data-ai-hint="palmistry diagram" 
                />
              </div>
            </CardContent>
          </Card>

           <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                <Sparkles className="mr-2 h-6 w-6" /> Mounts and Hand Shape
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 space-y-3">
              <p>
                <strong>Mounts:</strong> These are the fleshy pads on your palm, such as the Mount of Venus (base of the thumb), Mount of Jupiter (base of the index finger), etc. Each mount is associated with specific planetary energies and traits, like love, ambition, or creativity.
              </p>
              <p>
                <strong>Hand Shape:</strong> The overall shape of the hand (e.g., square, long, spatulate, conic) and the length/shape of fingers are also considered. These can provide general insights into temperament and approach to life. For example, square hands might suggest practicality, while long fingers might indicate a detail-oriented nature.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-headline text-primary">
                 <Sparkles className="mr-2 h-6 w-6" /> Further Exploration
              </CardTitle>
            </CardHeader>
             <CardContent className="text-foreground/80 space-y-3">
                <p>
                    Palmistry is a vast field! Beyond the major lines and mounts, experienced readers also consider:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Minor lines (e.g., intuition line, health line)</li>
                    <li>Markings (stars, crosses, squares, grilles)</li>
                    <li>Fingerprints</li>
                    <li>The texture and flexibility of the skin</li>
                </ul>
                <p>
                    Each detail adds another layer to the reading, creating a holistic view of an individual's potential and personality.
                </p>
            </CardContent>
          </Card>
        </div>

      </main>
      <footer className="text-center py-8 border-t border-border/50 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cosmic Compass. All rights reserved.</p>
        <p className="font-headline mt-1">Let the stars guide your way.</p>
      </footer>
    </div>
  );
}

    