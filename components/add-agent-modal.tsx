"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { UserPlus, Loader2 } from "lucide-react"

interface AddAgentModalProps {
  onAgentAdded?: () => void
  trigger?: React.ReactNode
}

export function AddAgentModal({ onAgentAdded, trigger }: AddAgentModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "agent",
    department: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.companyAccountId) {
      toast({
        title: "Error",
        description: "No company account found",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // First, invite the user to create an account
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(formData.email, {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          company_account_id: user.companyAccountId,
        },
      })

      if (authError) {
        // If admin invite fails, create user record directly
        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: formData.role,
            company_account_id: user.companyAccountId,
            department: formData.department,
            notes: formData.notes,
            is_active: true,
          })
          .select()
          .single()

        if (userError) throw userError

        toast({
          title: "Agent Added",
          description: `${formData.firstName} ${formData.lastName} has been added to your team. They will need to sign up using the email ${formData.email}.`,
        })
      } else {
        // If auth invite succeeds, create the user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user?.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          company_account_id: user.companyAccountId,
          department: formData.department,
          notes: formData.notes,
          is_active: true,
        })

        if (profileError) throw profileError

        toast({
          title: "Agent Invited",
          description: `Invitation sent to ${formData.firstName} ${formData.lastName} at ${formData.email}`,
        })
      }

      // Reset form and close modal
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "agent",
        department: "",
        notes: "",
      })
      setOpen(false)
      onAgentAdded?.()
    } catch (error) {
      console.error("Error adding agent:", error)
      toast({
        title: "Error",
        description: "Failed to add agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+254 700 000 000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="e.g., Sales, Leasing"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional information about this agent..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
