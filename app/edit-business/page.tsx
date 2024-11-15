'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditBusinessPage() {
    const router = useRouter();
    const [businessName, setBusinessName] = useState('My Business')
    const [logo, setLogo] = useState('https://placehold.co/100x100')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogo(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            // Redirect to dashboard after successful update
            window.location.href = '/dashboard'
        }, 2000)
    }

    const handleGoBack = ()=>{
        router.push("/dashboard");
    }

    return (
        <div className="container mx-auto p-4">
            <button 
              className="w-fit flex flex-row items-center justify-start text-sm h-12 opacity-70"
              onClick={handleGoBack}
              type="button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Edit my business</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo</Label>
                                <div className="flex items-center space-x-4">
                                    <img src={logo} alt="Business Logo" className="w-16 h-16 object-cover rounded-full" />
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}