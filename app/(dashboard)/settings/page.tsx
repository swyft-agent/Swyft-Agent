"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Building, Bell, AlertCircle, CheckCircle, Globe, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface UserSettings {
  // Profile
  full_name: string
  email: string
  phone: string

  // Company
  company_name: string
  company_address: string
  company_phone: string

  // Notifications
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  inquiry_notifications: boolean
  payment_notifications: boolean

  // Auto-response
  auto_respond_inquiries: boolean
  auto_response_message: string

  // Display
  currency: string
  timezone: string
  language: string

  // Privacy
  profile_visibility: string
  show_contact_info: boolean
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
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    inquiry_notifications: true,
    payment_notifications: true,
    auto_respond_inquiries: false,
    auto_response_message: "",
    currency: "KES",
    timezone: "Africa/Nairobi",
    language: "en",
    profile_visibility: "public",
    show_contact_info: true,
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

      // Fetch settings data
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (settingsError && settingsError.code !== "PGRST116") throw settingsError

      setSettings({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        company_name: companyData?.company_name || "",
        company_address: companyData?.address || "",
        company_phone: companyData?.phone || "",
        email_notifications: settingsData?.email_notifications ?? true,
        sms_notifications: settingsData?.sms_notifications ?? true,
        push_notifications: settingsData?.push_notifications ?? true,
        inquiry_notifications: settingsData?.inquiry_notifications ?? true,
        payment_notifications: settingsData?.payment_notifications ?? true,
        auto_respond_inquiries: settingsData?.auto_respond_inquiries ?? false,
        auto_response_message: settingsData?.auto_response_message || "",
        currency: settingsData?.currency || "KES",
        timezone: settingsData?.timezone || "Africa/Nairobi",
        language: settingsData?.language || "en",
        profile_visibility: settingsData?.profile_visibility || "public",
        show_contact_info: settingsData?.show_contact_info ?? true,
      })
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (section: "profile" | "company" | "notifications" | "display" | "privacy") => {
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

      if (section === "notifications" || section === "display" || section === "privacy") {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company_account_id")
          .eq("id", user?.id)
          .single()

        if (userError) throw userError

        const { error } = await supabase.from("settings").upsert({
          user_id: user?.id,
          company_account_id: userData.company_account_id,
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          push_notifications: settings.push_notifications,
          inquiry_notifications: settings.inquiry_notifications,
          payment_notifications: settings.payment_notifications,
          auto_respond_inquiries: settings.auto_respond_inquiries,
          auto_response_message: settings.auto_response_message,
          currency: settings.currency,
          timezone: settings.timezone,
          language: settings.language,
          profile_visibility: settings.profile_visibility,
          show_contact_info: settings.show_contact_info,
        })

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
      <div className="w-full space-y-4 p-4 md:p-6">
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
    <div className="w-full space-y-4 p-4 md:p-6">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
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
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Inquiry Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about new inquiries</p>
                </div>
                <Switch
                  checked={settings.inquiry_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, inquiry_notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about payments and transactions</p>
                </div>
                <Switch
                  checked={settings.payment_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, payment_notifications: checked })}
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
              {settings.auto_respond_inquiries && (
                <div>
                  <Label htmlFor="auto_response_message">Auto-response Message</Label>
                  <Textarea
                    id="auto_response_message"
                    value={settings.auto_response_message}
                    onChange={(e) => setSettings({ ...settings, auto_response_message: e.target.value })}
                    placeholder="Thank you for your inquiry. We will get back to you shortly."
                    rows={3}
                  />
                </div>
              )}
              <Button onClick={() => saveSettings("notifications")} disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => setSettings({ ...settings, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => saveSettings("display")} disabled={saving}>
                {saving ? "Saving..." : "Save Display Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profile_visibility">Profile Visibility</Label>
                <Select
                  value={settings.profile_visibility}
                  onValueChange={(value) => setSettings({ ...settings, profile_visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">Control who can see your profile information</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Contact Information</Label>
                  <p className="text-sm text-gray-500">Display your contact info on listings</p>
                </div>
                <Switch
                  checked={settings.show_contact_info}
                  onCheckedChange={(checked) => setSettings({ ...settings, show_contact_info: checked })}
                />
              </div>
              <Button onClick={() => saveSettings("privacy")} disabled={saving}>
                {saving ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
