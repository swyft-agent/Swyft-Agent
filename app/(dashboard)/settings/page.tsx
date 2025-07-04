"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Building, Bell, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface UserSettings {
  full_name: string
  email: string
  phone: string
  company_name: string
  company_address: string
  company_phone: string
  notifications_email: boolean
  notifications_sms: boolean
  notifications_push: boolean
  auto_respond_inquiries: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    company_address: "",
    company_phone: "",
    notifications_email: true,
    notifications_sms: true,
    notifications_push: true,
    auto_respond_inquiries: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.id) {
      fetchSettings()
    }
  }, [user?.id])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // Fetch user data
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user?.id).single()

      if (userError) throw userError

      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from("company_accounts")
        .select("*")
        .eq("company_account_id", userData.company_account_id)
        .single()

      if (companyError && companyError.code !== "PGRST116") throw companyError

      setSettings({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        company_name: companyData?.company_name || "",
        company_address: companyData?.address || "",
        company_phone: companyData?.phone || "",
        notifications_email: userData.notifications_email ?? true,
        notifications_sms: userData.notifications_sms ?? true,
        notifications_push: userData.notifications_push ?? true,
        auto_respond_inquiries: userData.auto_respond_inquiries ?? false,
      })
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (section: "profile" | "company" | "notifications") => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      if (section === "profile") {
        const { error } = await supabase
          .from("users")
          .update({
            full_name: settings.full_name,
            phone: settings.phone,
          })
          .eq("id", user?.id)

        if (error) throw error
      }

      if (section === "company") {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company_account_id")
          .eq("id", user?.id)
          .single()

        if (userError) throw userError

        const { error } = await supabase.from("company_accounts").upsert({
          company_account_id: userData.company_account_id,
          company_name: settings.company_name,
          address: settings.company_address,
          phone: settings.company_phone,
        })

        if (error) throw error
      }

      if (section === "notifications") {
        const { error } = await supabase
          .from("users")
          .update({
            notifications_email: settings.notifications_email,
            notifications_sms: settings.notifications_sms,
            notifications_push: settings.notifications_push,
            auto_respond_inquiries: settings.auto_respond_inquiries,
          })
          .eq("id", user?.id)

        if (error) throw error
      }

      setSuccess("Settings saved successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={settings.full_name}
                    onChange={(e) => setSettings({ ...settings, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={settings.email} disabled className="bg-gray-50" />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+254712345678"
                />
              </div>
              <Button onClick={() => saveSettings("profile")} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  placeholder="Your Real Estate Company"
                />
              </div>
              <div>
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  value={settings.company_address}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  placeholder="123 Main Street, Nairobi, Kenya"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="company_phone">Company Phone</Label>
                <Input
                  id="company_phone"
                  value={settings.company_phone}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  placeholder="+254700000000"
                />
              </div>
              <Button onClick={() => saveSettings("company")} disabled={saving}>
                {saving ? "Saving..." : "Save Company Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications_email}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications_email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.notifications_sms}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications_sms: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={settings.notifications_push}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications_push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-respond to Inquiries</Label>
                  <p className="text-sm text-gray-500">Automatically send response to new inquiries</p>
                </div>
                <Switch
                  checked={settings.auto_respond_inquiries}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_respond_inquiries: checked })}
                />
              </div>
              <Button onClick={() => saveSettings("notifications")} disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Change Password</h3>
                <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure</p>
                <Button variant="outline">Change Password</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Active Sessions</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Manage devices that are currently signed in to your account
                </p>
                <Button variant="outline">View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
