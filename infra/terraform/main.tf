terraform {
  required_version = ">= 1.6.0"

  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.20"
    }
  }
}

provider "mongodbatlas" {
  public_key  = var.mongodb_public_key
  private_key = var.mongodb_private_key
}

resource "mongodbatlas_project" "skillmap" {
  name   = "skill-map"
  org_id = var.mongodb_org_id
}

resource "mongodbatlas_cluster" "skillmap" {
  project_id   = mongodbatlas_project.skillmap.id
  name         = "skillmap-cluster"
  cluster_type = "REPLICASET"

  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = var.mongodb_region
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
    }
  }

  cloud_backup                 = true
  auto_scaling_disk_gb_enabled = true
  mongo_db_major_version       = "7.0"

  provider_name               = "AWS"
  provider_instance_size_name = "M10"
}

resource "mongodbatlas_database_user" "skillmap" {
  username           = "skillmap_app"
  project_id         = mongodbatlas_project.skillmap.id
  password           = var.mongodb_password
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = "skillmap"
  }
}

variable "mongodb_public_key" {
  type      = string
  sensitive = true
}

variable "mongodb_private_key" {
  type      = string
  sensitive = true
}

variable "mongodb_org_id" {
  type = string
}

variable "mongodb_password" {
  type      = string
  sensitive = true
}

variable "mongodb_region" {
  type    = string
  default = "AP_SOUTH_1"
}

output "connection_string" {
  value     = mongodbatlas_cluster.skillmap.connection_strings[0].standard_srv
  sensitive = true
}
