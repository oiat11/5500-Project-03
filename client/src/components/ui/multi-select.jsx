import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  className,
  isLoading = false,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const commandRef = useRef(null);

  const selected = value.map((item) => item.value);

  const handleSelect = (option) => {
    const isSelected = selected.includes(option.value);
    let updatedValue;

    if (isSelected) {
      updatedValue = value.filter((item) => item.value !== option.value);
    } else {
      updatedValue = [...value, option];
    }

    onChange(updatedValue);
  };

  const handleRemove = (option) => {
    const updatedValue = value.filter((item) => item.value !== option.value);
    onChange(updatedValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 py-2", 
            className
          )}
          onClick={() => setOpen(!open)}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : value.length > 0 ? (
            <div className="flex flex-wrap gap-1 w-full overflow-hidden">
              {value.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 mb-1 flex items-center gap-1"
                  style={{ 
                    backgroundColor: option.color ? `${option.color}20` : undefined,
                    borderColor: option.color,
                    color: option.color
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(option);
                  }}
                >
                  <span 
                    className="h-2 w-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={5}>
        <Command ref={commandRef}>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-sm border h-4 w-4 flex items-center justify-center",
                        isSelected ? "bg-primary border-primary" : "border-input"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="h-3 w-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: option.color }}
                      />
                      <span>{option.label}</span>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 