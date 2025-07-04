"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  User,
  Bell,
  Palette,
  Globe,
  CreditCard,
  Building,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface UserSettings {
  theme: string
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
  currency: string
  date_format: string
  timezone: string
  language: string
}

interface CompanySettings {
  company_name: string
  contact_name: string
  email: string
  phone: string
  address: string
  description: string
  subscription_plan: string
  auto_approve_listings: boolean
  require_viewing_fee: boolean
  default_lease_term: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: "light",
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    currency: "KSh",
    date_format: "DD/MM/YYYY",
    timezone: "Africa/Nairobi",
    language: "en",
  })

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    subscription_plan: "basic",
    auto_approve_listings: false,
    require_viewing_fee: true,
    default_lease_term: 12,
  })

  useEffect(() => {
    if (user?.id) {
      loadSettings()
      loadCompanyInfo()
    }
  }, [user?.id])

  const loadSettings = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Load user settings
      const { data: settings, error } = await supabase
        .from("settings")
        .select("setting_key, setting_value")
        .eq("user_id", user.id)

      if (error) {
        console.error("Error loading settings:", error)
        return
      }

      if (settings && settings.length > 0) {
        const settingsObj: any = {}
        settings.forEach((setting) => {
          try {
            settingsObj[setting.setting_key] = JSON.parse(setting.setting_value)
          } catch {
            settingsObj[setting.setting_key] = setting.setting_value
          }
        })

        setUserSettings((prev) => ({ ...prev, ...settingsObj }))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      setMessage({ type: "error", text: "Failed to load settings" })
    } finally {
      setLoading(false)
    }
  }

  const loadCompanyInfo = async () => {
    if (!user?.company_account_id) return

    try {
      const { data: company, error } = await supabase
        .from("company_accounts")
        .select("*")
        .eq("id", user.company_account_id)
        .single()

      if (error) {
        console.error("Error loading company info:", error)
        return
      }

      if (company) {
        setCompanySettings({
          company_name: company.company_name || "",
          contact_name: company.contact_name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          description: company.description || "",
          subscription_plan: company.subscription_plan || "basic",
          auto_approve_listings: company.auto_approve_listings || false,
          require_viewing_fee: company.require_viewing_fee || true,
          default_lease_term: company.default_lease_term || 12,
        })
      }
    } catch (error) {
      console.error("Error loading company info:", error)
    }
  }

  const saveUserSettings = async () => {
    if (!user?.id) return

    try {
      setSaving(true)

      // Prepare settings for upsert
      const settingsToSave = Object.entries(userSettings).map(([key, value]) => ({
        user_id: user.id,
        company_account_id: user.company_account_id,
        setting_key: key,
        setting_value: JSON.stringify(value),
        setting_type: "user",
      }))

      // Upsert settings
      for (const setting of settingsToSave) {
        const { error } = await supabase.from("settings").upsert(setting, {
          onConflict: "user_id,company_account_id,setting_key",
        })

        if (error) {
          console.error("Error saving setting:", error)
          throw error
        }
      }

      setMessage({ type: "success", text: "User settings saved successfully" })
    } catch (error) {
      console.error("Error saving user settings:", error)
      setMessage({ type: "error", text: "Failed to save user settings" })
    } finally {
      setSaving(false)
    }
  }

  const saveCompanySettings = async () => {
    if (!user?.company_account_id) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from("company_accounts")
        .update({
          company_name: companySettings.company_name,
          contact_name: companySettings.contact_name,
          email: companySettings.email,
          phone: companySettings.phone,
          address: companySettings.address,
          description: companySettings.description,
          subscription_plan: companySettings.subscription_plan,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.company_account_id)

      if (error) {
        console.error("Error saving company settings:", error)
        throw error
      }

      setMessage({ type: "success", text: "Company settings saved successfully" })
    } catch (error) {
      console.error("Error saving company settings:", error)
      setMessage({ type: "error", text: "Failed to save company settings" })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your account and application preferences</p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === "error" ? "border-red-500" : "border-green-500"}`}>
            {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="user" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User Settings
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={userSettings.theme}
                      onValueChange={(value) => setUserSettings((prev) => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={userSettings.language}
                      onValueChange={(value) => setUserSettings((prev) => ({ ...prev, language: value }))}
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications_enabled">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about your properties</p>
                  </div>
                  <Switch
                    id="notifications_enabled"
                    checked={userSettings.notifications_enabled}
                    onCheckedChange={(checked) =>
                      setUserSettings((prev) => ({ ...prev, notifications_enabled: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={userSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setUserSettings((prev) => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms_notifications"
                    checked={userSettings.sms_notifications}
                    onCheckedChange={(checked) => setUserSettings((prev) => ({ ...prev, sms_notifications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Settings
                </CardTitle>
                <CardDescription>Configure regional preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={userSettings.currency}
                      onValueChange={(value) => setUserSettings((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KSh">KSh (Kenyan Shilling)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date_format">Date Format</Label>
                    <Select
                      value={userSettings.date_format}
                      onValueChange={(value) => setUserSettings((prev) => ({ ...prev, date_format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={userSettings.timezone}
                      onValueChange={(value) => setUserSettings((prev) => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveUserSettings} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save User Settings"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            {user.company_account_id ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                    <CardDescription>Update your company details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={companySettings.company_name}
                          onChange={(e) => setCompanySettings((prev) => ({ ...prev, company_name: e.target.value }))}
                          placeholder="Your Company Name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contact_name">Contact Name</Label>
                        <Input
                          id="contact_name"
                          value={companySettings.contact_name}
                          onChange={(e) => setCompanySettings((prev) => ({ ...prev, contact_name: e.target.value }))}
                          placeholder="Primary Contact Person"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={companySettings.email}
                          onChange={(e) => setCompanySettings((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="company@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={companySettings.phone}
                          onChange={(e) => setCompanySettings((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+254 700 000 000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="Company address"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={companySettings.description}
                        onChange={(e) => setCompanySettings((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your company"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Subscription
                    </CardTitle>
                    <CardDescription>Manage your subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">
                          You are currently on the{" "}
                          <Badge variant="secondary">{companySettings.subscription_plan}</Badge> plan
                        </p>
                      </div>
                      <Button variant="outline">Upgrade Plan</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={saveCompanySettings} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Company Settings"}
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    You are not associated with a company account. Company settings are not available.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
