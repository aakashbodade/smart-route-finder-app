terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket  = "smart-route-finder-app-infra-statefile"
    profile = "terraformauth"
    key     = "terraform.tfstate"
    region  = "ap-south-1"
  }
}

provider "aws" {
  region  = "ap-south-1"
  profile = "terraformauth"
}

module "smart-route-finder-vpc" {
  source      = "./modules/vpc"
  cidr_block  = var.cidr_block
  environment = var.environment
  created_by  = var.created_by
  application = var.application
  region      = var.region
}

module "smart-route-finder-eks" {
  source     = "./modules/eks"
  subnet_ids = module.smart-route-finder-vpc.subnet_ids
}

# module "s3" {
#   source = "./modules/s3"
# }