import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export function DemoComponents() {
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SaaS Framework Demo</CardTitle>
          <CardDescription>
            This demo showcases the shadcn/ui components integrated with Next.js 14+ and Tailwind CSS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold">shadcn/ui Integration</h4>
              <p className="text-sm text-muted-foreground">All components working perfectly!</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="demo-input">Demo Input</Label>
            <Input id="demo-input" placeholder="Type something..." />
          </div>
          
          <div className="flex space-x-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">🚀 Try the Airtable Integration</h4>
            <Link href="/videos">
              <Button className="w-full">
                View Videos Dashboard →
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure to configure your .env.local file with Airtable credentials first!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
