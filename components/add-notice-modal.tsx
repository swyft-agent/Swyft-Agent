"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building, Calendar, FileText } from "lucide-react"

interface AddNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNotice: (notice: any) => void
}

export function AddNoticeModal({ open, onOpenChange, onAddNotice }: AddNoticeModalProps) {
  const [formData, setFormData] = useState({
    tenant: "",
    unit: "",
    property: "",
    type: "",
    date: "",
    description: "",
  })

  const tenants = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson", "Jennifer Taylor"]

  const properties = [
    "Skyline Apartments",
    "Parkview Heights",
    "Riverside Condos",
    "Downtown Lofts",
    "Harbor View Suites",
    "Oakwood Residences",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newNotice = {
      id: Date.now(),
      tenant: formData.tenant,
      unit: formData.unit,
      property: formData.property,
      type: formData.type,
      date: formData.date,
      status: "pending",
      description: formData.description,
    }

    onAddNotice(newNotice)
    onOpenChange(false)

    // Reset form
    setFormData({
      tenant: "",
      unit: "",
      property: "",
      type: "",
      date: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Notice</DialogTitle>
          <DialogDescription>Create a move-in or move-out notice for a tenant.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant *</Label>
            <Select value={formData.tenant} onValueChange={(value) => handleInputChange("tenant", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant} value={tenant}>
                    {tenant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Property *</Label>
              <Select value={formData.property} onValueChange={(value) => handleInputChange("property", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property} value={property}>
                      {property}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit Number *</Label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="unit"
                  placeholder="302"
                  className="pl-8"
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Notice Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="move-in">Move-in Notice</SelectItem>
                  <SelectItem value="move-out">Move-out Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Notice Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-8"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                placeholder="Additional details about the notice..."
                className="pl-8 min-h-[80px]"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Notice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
