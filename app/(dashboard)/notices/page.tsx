"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, PlusCircle, Trash2, Edit, FileText } from "lucide-react"
import { fetchNotices } from "@/lib/supabase-data"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import EmptyState from "@/components/empty-state"
import type { Notice } from "@/lib/types"

function NoticesPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="bg-gray-200 h-10 w-64 rounded-md animate-pulse" />
        <div className="bg-gray-200 h-10 w-32 rounded-md animate-pulse" />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="bg-gray-200 h-5 w-32 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-gray-200 h-5 w-40 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-gray-200 h-5 w-24 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-gray-200 h-5 w-20 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="bg-gray-200 h-5 w-16 rounded-full animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="bg-gray-200 h-8 w-8 rounded-md animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const getNotices = async () => {
    try {
      setLoading(true)
      const data = await fetchNotices()
      setNotices(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error fetching notices",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getNotices()
  }, [])

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const tenantName = notice.tenants?.name || ""
      const buildingName = notice.buildings?.name || ""
      const unitNumber = notice.units?.unit_number || ""
      const noticeType = notice.notice_type || ""

      return (
        tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticeType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [notices, searchTerm])

  const deleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return

    const { error } = await supabase.from("notices").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error deleting notice",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Notice deleted successfully",
      })
      getNotices()
    }
  }

  if (loading) {
    return <NoticesPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notices</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={getNotices}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notices</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notices..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Notice
          </Button>
        </div>
      </div>

      {filteredNotices.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-gray-400" />}
          title={searchTerm ? "No matching notices" : "No notices found"}
          description={searchTerm ? "Try a different search term." : "Create a new notice to get started."}
          action={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Notice
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    <div className="font-medium">{notice.tenants?.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{notice.tenants?.phone_number || ""}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{notice.buildings?.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Unit {notice.units?.unit_number || "N/A"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{notice.notice_type}</Badge>
                  </TableCell>
                  <TableCell>{new Date(notice.date_issued).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={notice.status === "delivered" ? "default" : "outline"}
                      className={
                        notice.status === "delivered" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {notice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteNotice(notice.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
