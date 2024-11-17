import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, SortDesc } from "lucide-react";
import { AgentFilters } from "@/types/agent";

interface SearchFiltersProps {
  filters: AgentFilters;
  onFiltersChange: (filters: AgentFilters) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search agents..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="max-w-sm"
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: 'all' })}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: 'active' })}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: 'inactive' })}>
            Inactive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Type</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, type: 'all' })}>
            All Types
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, type: 'assistant' })}>
            Assistant
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, type: 'analyzer' })}>
            Analyzer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SortDesc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
          <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
          <DropdownMenuItem>Rating (High to Low)</DropdownMenuItem>
          <DropdownMenuItem>Rating (Low to High)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}