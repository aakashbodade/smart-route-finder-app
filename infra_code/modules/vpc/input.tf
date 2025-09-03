variable "application" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "created_by" {
  description = "IAC name"
  type        = string
}

variable "region" {
  description = "Default region"
  type        = string
}

variable "cidr_block" {
  description = "VPC cidr block"
}