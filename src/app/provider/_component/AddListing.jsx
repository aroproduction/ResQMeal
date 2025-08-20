"use client"

import { useState } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Plus,
  Upload,
  Clock,
  MapPin,
  AlertCircle,
  Camera,
  Utensils,
  Info,
  X,
  CheckCircle,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const AddListing = () => {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foodItems: [{ name: "", quantity: "", unit: "kg" }],
    freshness: "FRESH",
    allergens: [],
    dietaryInfo: [],
    pickupHours: "",
    pickupInstructions: "",
    photos: [],
  })

  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const freshnessLevels = [
    {
      value: "FRESHLY_COOKED",
      label: "Freshly Cooked",
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-300 shadow-sm",
      description: "Just prepared, still warm",
      icon: "🔥",
    },
    {
      value: "FRESH",
      label: "Fresh",
      color: "bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-300 shadow-sm",
      description: "Recently prepared, excellent quality",
      icon: "✨",
    },
    {
      value: "GOOD",
      label: "Good",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-300 shadow-sm",
      description: "Good condition, safe to consume",
      icon: "👍",
    },
    {
      value: "NEAR_EXPIRY",
      label: "Near Expiry",
      color: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800 border-amber-300 shadow-sm",
      description: "Should be consumed soon",
      icon: "⏰",
    },
    {
      value: "USE_IMMEDIATELY",
      label: "Use Immediately",
      color: "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-300 shadow-sm",
      description: "Needs immediate consumption",
      icon: "🚨",
    },
  ]

  const allergenOptions = ["Nuts", "Dairy", "Gluten", "Eggs", "Soy", "Shellfish", "Fish", "Sesame"]
  const dietaryOptions = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free", "Organic"]
  const unitOptions = ["kg", "pieces", "plates", "liters", "grams", "portions"]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFoodItemChange = (index, field, value) => {
    const newFoodItems = [...formData.foodItems]
    newFoodItems[index][field] = value
    setFormData((prev) => ({ ...prev, foodItems: newFoodItems }))
  }

  const addFoodItem = () => {
    setFormData((prev) => ({
      ...prev,
      foodItems: [...prev.foodItems, { name: "", quantity: "", unit: "kg" }],
    }))
  }

  const removeFoodItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      foodItems: prev.foodItems.filter((_, i) => i !== index),
    }))
  }

  const toggleArrayItem = (array, item) => {
    const newArray = array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
    return newArray
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - formData.photos.length;

    if (remainingSlots === 0) {
      toast.error("You can only upload up to 3 photos")
      return
    }

    const newPhotos = Array.from(files).slice(0, remainingSlots)

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} photo(s) can be added. Upload limit is 3 photos.`)
    }

    // Validate file types and sizes
    const validPhotos = []
    for (const file of newPhotos) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        continue
      }
      validPhotos.push(file)
    }

    if (validPhotos.length === 0) return

    // Add files to state immediately for preview
    const fileObjects = validPhotos.map(file => ({
      file,
      url: URL.createObjectURL(file),
      uploaded: false,
      uploading: true,
      publicId: null // For Cloudinary
    }))

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...fileObjects],
    }))

    // Upload files in background
    try {
      const formDataToUpload = new FormData()
      validPhotos.forEach(file => {
        formDataToUpload.append('photos', file)
      })

      const response = await axios.post('/api/provider/upload', formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        // Update the photos with upload URLs and Cloudinary data
        setFormData((prev) => {
          const updatedPhotos = [...prev.photos]
          let uploadedFileIndex = 0

          for (let i = updatedPhotos.length - validPhotos.length; i < updatedPhotos.length; i++) {
            if (updatedPhotos[i].uploading) {
              updatedPhotos[i] = {
                ...updatedPhotos[i],
                url: response.data.files[uploadedFileIndex].url,
                publicId: response.data.files[uploadedFileIndex].publicId,
                uploaded: true,
                uploading: false
              }
              uploadedFileIndex++
            }
          }

          return { ...prev, photos: updatedPhotos }
        })

        toast.success(`${validPhotos.length} photo(s) uploaded successfully!`)
      }
    } catch (error) {
      console.error('Error uploading photos:', error)

      // Show specific error message if available
      const errorMessage = error.response?.data?.error || "Failed to upload photos. Please try again."
      toast.error(errorMessage)

      // Remove failed uploads from state
      setFormData((prev) => ({
        ...prev,
        photos: prev.photos.filter(photo => !photo.uploading),
      }))
    }
  }

  const removePhoto = async (index) => {
    const photo = formData.photos[index]

    // Clean up blob URL if it exists
    if (photo.url && photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }

    // If photo was uploaded to Cloudinary, delete it
    if (photo.uploaded && photo.publicId) {
      try {
        await axios.delete(`/api/provider/upload/${encodeURIComponent(photo.publicId)}`)
      } catch (error) {
        console.error('Failed to delete photo from Cloudinary:', error)
        // Continue with removal from state even if Cloudinary deletion fails
      }
    }

    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!session) {
      toast.error("Please log in to create a listing")
      return
    }

    // Check for pending uploads
    const pendingUploads = formData.photos.filter(photo => photo.uploading)
    if (pendingUploads.length > 0) {
      toast.error("Please wait for photo uploads to complete")
      return
    }

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your listing")
      return
    }

    if (!formData.pickupInstructions.trim()) {
      toast.error("Please provide pickup instructions")
      return
    }

    // Validate food items
    const validFoodItems = formData.foodItems.filter(item =>
      item.name.trim() && item.quantity && parseFloat(item.quantity) > 0
    )

    if (validFoodItems.length === 0) {
      toast.error("Please add at least one valid food item")
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        foodItems: validFoodItems.map(item => ({
          name: item.name.trim(),
          quantity: parseFloat(item.quantity),
          unit: item.unit
        })),
        freshness: formData.freshness,
        allergens: formData.allergens,
        dietaryInfo: formData.dietaryInfo,
        pickupHours: formData.pickupHours || "9:00 AM - 6:00 PM",
        pickupInstructions: formData.pickupInstructions.trim(),
        photos: formData.photos
          .filter(photo => photo.uploaded && photo.url)
          .map(photo => photo.url)
      }

      console.log("Submitting listing data:", submissionData)

      const response = await axios.post('/api/provider/listings', submissionData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        toast.success("Listing created successfully!")

        // Clean up blob URLs
        formData.photos.forEach(photo => {
          if (photo.url && photo.url.startsWith('blob:')) {
            URL.revokeObjectURL(photo.url)
          }
        })

        // Reset form
        setFormData({
          title: "",
          description: "",
          foodItems: [{ name: "", quantity: "", unit: "kg" }],
          freshness: "FRESH",
          allergens: [],
          dietaryInfo: [],
          pickupHours: "",
          pickupInstructions: "",
          photos: [],
        })

        // Optional: Redirect to dashboard or listings page
        // router.push('/provider/dashboard')
      }
    } catch (error) {
      console.error('Error creating listing:', error)

      if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`)
      } else if (error.response?.status === 401) {
        toast.error("Please log in to create a listing")
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to create listings")
      } else {
        toast.error("Failed to create listing. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Card className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-0 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-500/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <CardTitle className="text-4xl font-bold text-white flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    Add New Food Listing
                    <Sparkles className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div className="text-lg font-normal text-emerald-100 opacity-90">
                    Share your surplus food and help reduce waste while feeding those in need
                  </div>
                </div>
              </CardTitle>

              <div className="flex items-center gap-3 mt-6 text-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Quick & Easy</span>
                </div>
                <div className="w-1 h-1 bg-emerald-200 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">5 min setup</span>
                </div>
                <div className="w-1 h-1 bg-emerald-200 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">Local impact</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Info className="w-6 h-6 text-emerald-600" />
                </div>
                Basic Information
                <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                  <Label
                    htmlFor="title"
                    className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2"
                  >
                    Listing Title
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Fresh Vegetables from Lunch Service"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-14 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg px-6 shadow-sm hover:shadow-md transition-all duration-200"
                    required
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="description" className="text-base font-semibold text-gray-800 mb-3 block">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the food items, cooking method, or any special notes..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 resize-none text-lg shadow-sm hover:shadow-md transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                Food Items
                <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700">
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {formData.foodItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 border-2 border-gray-100 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white hover:shadow-lg transition-all duration-200"
                >
                  <div className="md:col-span-5">
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Food Item Name *</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Rice, Bread, Curry"
                      value={item.name}
                      onChange={(e) => handleFoodItemChange(index, "name", e.target.value)}
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-emerald-500 shadow-sm"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Quantity *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleFoodItemChange(index, "quantity", e.target.value)}
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-emerald-500 shadow-sm"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Unit</Label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleFoodItemChange(index, "unit", e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                    >
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    {formData.foodItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFoodItem(index)}
                        className="h-12 w-12 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFoodItem}
                className="w-full h-14 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200 bg-transparent cursor-pointer"
              >
                <Plus className="w-6 h-6 mr-3" />
                Add Another Food Item
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                Quality & Dietary Information
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                  Important
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Freshness Level */}
              <div>
                <Label className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Freshness Level
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freshnessLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange("freshness", level.value)}
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${formData.freshness === level.value
                        ? level.color + " border-current shadow-lg scale-105"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-md"
                        }`}
                    >
                      <div className="text-2xl mb-2">{level.icon}</div>
                      <div className="font-semibold text-sm mb-1">{level.label}</div>
                      <div className="text-xs opacity-75">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-800 mb-4 block">
                  Allergens (Select all that apply)
                </Label>
                <div className="flex flex-wrap gap-3">
                  {allergenOptions.map((allergen) => (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => handleInputChange("allergens", toggleArrayItem(formData.allergens, allergen))}
                      className={`px-6 py-3 rounded-full border-2 transition-all duration-200 font-medium hover:scale-105 ${formData.allergens.includes(allergen)
                        ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-300 shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:shadow-sm"
                        }`}
                    >
                      {allergen}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-800 mb-4 block">
                  Dietary Information (Select all that apply)
                </Label>
                <div className="flex flex-wrap gap-3">
                  {dietaryOptions.map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => handleInputChange("dietaryInfo", toggleArrayItem(formData.dietaryInfo, diet))}
                      className={`px-6 py-3 rounded-full border-2 transition-all duration-200 font-medium hover:scale-105 ${formData.dietaryInfo.includes(diet)
                        ? "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-300 shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:shadow-sm"
                        }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                Pickup & Timing
                <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-700">
                  Critical
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div>
                <Label className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  How long will this food remain good for pickup?
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      value: "1",
                      label: "1 hour",
                      color: "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-300",
                      urgency: "Urgent",
                    },
                    {
                      value: "2",
                      label: "2 hours",
                      color: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 border-orange-300",
                      urgency: "High",
                    },
                    {
                      value: "4",
                      label: "4 hours",
                      color: "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-300",
                      urgency: "Medium",
                    },
                    {
                      value: "6",
                      label: "6 hours",
                      color: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-300",
                      urgency: "Normal",
                    },
                    {
                      value: "12",
                      label: "12 hours",
                      color: "bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-300",
                      urgency: "Flexible",
                    },
                    {
                      value: "24",
                      label: "1 day",
                      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-300",
                      urgency: "Relaxed",
                    },
                    {
                      value: "48",
                      label: "2 days",
                      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-300",
                      urgency: "Extended",
                    },
                    {
                      value: "custom",
                      label: "Custom",
                      color: "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-300",
                      urgency: "Custom",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange("pickupHours", option.value)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center hover:scale-105 ${formData.pickupHours === option.value
                        ? option.color + " border-current shadow-lg scale-105"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-md"
                        }`}
                    >
                      <div className="font-semibold text-sm mb-1">{option.label}</div>
                      <div className="text-xs opacity-75">{option.urgency}</div>
                    </button>
                  ))}
                </div>

                {formData.pickupHours === "custom" && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-2 border-gray-200">
                    <Label htmlFor="customHours" className="text-base font-semibold text-gray-800 mb-3 block">
                      Custom Hours *
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="customHours"
                        type="number"
                        min="1"
                        max="168"
                        placeholder="Enter hours"
                        className="h-14 rounded-xl flex-1 border-2 border-gray-200 focus:border-emerald-500 text-lg px-4"
                        onChange={(e) => handleInputChange("customPickupHours", e.target.value)}
                      />
                      <span className="text-gray-600 font-semibold text-lg">hours</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Maximum 168 hours (1 week)</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-500 rounded-full shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-2 text-lg">Pro Tip</h4>
                    <p className="text-emerald-800 leading-relaxed">
                      Shorter pickup times will notify nearby receivers more urgently. Consider food safety and quality
                      when selecting the time frame.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="pickupInstructions" className="text-base font-semibold text-gray-800 mb-3 block">
                  Pickup Instructions
                </Label>
                <textarea
                  id="pickupInstructions"
                  rows={4}
                  placeholder="Specific pickup location, contact information, or special instructions..."
                  value={formData.pickupInstructions}
                  onChange={(e) => handleInputChange("pickupInstructions", e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 resize-none text-lg shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-xl">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                Photos
                <Badge variant="secondary" className="ml-auto bg-pink-100 text-pink-700">
                  Optional
                </Badge>
              </CardTitle>
              <p className="text-gray-600 mt-2 text-lg">
                Add photos to help receivers see the quality and quantity of food
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div
                className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${dragActive
                  ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 scale-105"
                  : "border-gray-300 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-emerald-100/50 hover:scale-102"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('photo-upload').click()}
              >
                <div className="mb-6">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-700 mb-2">Drag and drop photos here</div>
                  <div className="text-lg text-gray-500 mb-6">or click anywhere to select files</div>
                  <div className="text-sm text-gray-400">Maximum 3 photos, up to 10MB each • JPG, PNG, WEBP</div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                  max="3"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold bg-transparent pointer-events-none"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Select Photos
                </Button>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={`Food photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-2xl border-2 border-gray-200 shadow-sm group-hover:shadow-lg transition-all duration-200"
                      />
                      {photo.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      {!photo.uploaded && !photo.uploading && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-2xl">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600 hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Publish Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddListing
