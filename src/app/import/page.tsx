'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function ImportPage() {
  const [csvContent, setCsvContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvContent(content)
      setError(null)
      setUploadResult(null)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!csvContent.trim()) {
      setError('Please upload a CSV file first')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/import/ddd-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvContent }),
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult(result)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const sampleCSV = `restaurant,city,region,country,dish,notes,show,season,episode,url
"Joe's Diner","Austin","TX","USA","Smashburger Deluxe","Juicy beef with caramelized onions","DDD",15,8,"https://example.com"
"BBQ Palace","Austin","TX","USA","Brisket Tacos","Slow-smoked brisket tacos","DDD",12,3,"https://example.com"`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Import DDD Hitlist</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload a CSV file with your Diners, Drive-Ins and Dives hitlist to add restaurants and dishes to the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Click to upload CSV</p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                </label>
              </div>

              {csvContent && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview (first 200 characters):</p>
                  <p className="text-xs font-mono bg-white p-2 rounded border">
                    {csvContent.substring(0, 200)}...
                  </p>
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={!csvContent || isUploading}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : 'Import Data'}
              </Button>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {uploadResult && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>Import completed successfully!</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Required Columns:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>restaurant</strong> - Restaurant name</li>
                  <li>• <strong>city</strong> - City name</li>
                  <li>• <strong>dish</strong> - Dish name</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Optional Columns:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>region</strong> - State/province</li>
                  <li>• <strong>country</strong> - Country (defaults to USA)</li>
                  <li>• <strong>notes</strong> - Description or notes</li>
                  <li>• <strong>show</strong> - Show name (e.g., "DDD")</li>
                  <li>• <strong>season</strong> - Season number</li>
                  <li>• <strong>episode</strong> - Episode number</li>
                  <li>• <strong>url</strong> - Related URL</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sample CSV:</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
{sampleCSV}
                  </pre>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Restaurants are matched by name and city</li>
                  <li>• Dishes are matched by name within each restaurant</li>
                  <li>• All DDD dishes are marked as "must-order"</li>
                  <li>• Embeddings are created for semantic search</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {uploadResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {uploadResult.summary.totalRows}
                  </div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResult.summary.createdRestaurants}
                  </div>
                  <div className="text-sm text-gray-600">New Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {uploadResult.summary.createdDishes}
                  </div>
                  <div className="text-sm text-gray-600">New Dishes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadResult.summary.errors}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
