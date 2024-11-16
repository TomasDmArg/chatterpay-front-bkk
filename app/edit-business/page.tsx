'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

import businessService from '@/services/businessService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/user'
import { Business } from '@/types/api'

import { Cancel01Icon, FloppyDiskIcon } from "hugeicons-react";

/**
 * Interface for the form data matching the API types
 */
interface BusinessFormData {
  name: string
  photo: string
  owner: string
}

/**
 * EditBusinessPage component handles loading, displaying and updating business data
 */
export default function EditBusinessPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth();
    const [businessDetails, setBusinessDetails] = useState<Business | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [formData, setFormData] = useState<BusinessFormData>({
        name: '',
        photo: '',
        owner: ''
    })

    /**
     * Loads business data when component mounts
     */
    useEffect(() => {
        const loadBusinessData = async () => {
            try {
                setIsLoading(true)
                const businessesData = await businessService.getAllBusinesses();
            
                const myBusiness = businessesData.businesses.find(bs => bs.owner === user?.id);
                
                if (!myBusiness) {
                    return;
                }

                setBusinessDetails(myBusiness)

                setFormData({
                    name: myBusiness.name,
                    photo: myBusiness.photo!,
                    owner: myBusiness.owner
                })

            } catch (error) {
                console.error('Error loading business:', error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load business data"
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadBusinessData()
    }, [user, toast])

    /**
     * Updates the form data when input values change
     * @param field - The field to update
     * @param value - The new value
     */
    const handleInputChange = (field: keyof BusinessFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }))
    }

    /**
     * Handles the form submission
     * @param event - The form submission event
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsSaving(true)
        
        try {
            await businessService.updateBusiness(businessDetails?._id!, formData)
            toast({
                title: "Success",
                description: "Business updated successfully"
            })
            router.push('/dashboard')
        } catch (error) {
            console.error('Error updating business:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update business"
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
                <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <button 
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-fit flex flex-row items-center justify-start text-sm h-12 opacity-70"
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
                        <CardTitle>Edit Business</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    placeholder="Enter business name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="photo">Logo URL</Label>
                                <div className="flex items-center space-x-4">
                                    <img 
                                        src={formData.photo || 'https://placehold.co/100x100'} 
                                        alt="Business Logo" 
                                        className="w-16 h-16 object-cover rounded-full"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement
                                            img.src = 'https://placehold.co/100x100'
                                        }}
                                    />
                                    <Input
                                        id="photo"
                                        type="url"
                                        value={formData.photo}
                                        onChange={handleInputChange('photo')}
                                        placeholder="Enter logo URL"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <Button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full sm:w-auto"
                                >
                                    {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSaving ? 'Saving...' : (
                                        <>Save Changes <FloppyDiskIcon /></>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel <Cancel01Icon />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}