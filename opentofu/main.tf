# ==============================================================================
# 1. PROVIDER & VARIABLES
# ==============================================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token"
  sensitive   = true
}

variable "account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "dns_records" {
  type = map(object({
    name    = string
    content = string
  }))
  default = {
    "root"   = { name = "@", content = "site-resume-618.pages.dev" }
    "resume" = { name = "resume", content = "hobbes3.com" }
    "fec"    = { name = "fec", content = "site-fec-2016.pages.dev" }
    "www"    = { name = "www", content = "site-resume-618.pages.dev" }
  }
}

# ==============================================================================
# 2. RESOURCE DEFINITIONS 
# ==============================================================================

# --- Cloudflare Pages ---

resource "cloudflare_pages_project" "site" {
  account_id        = var.account_id
  name              = "site-resume"
  production_branch = "main"
}

resource "cloudflare_pages_project" "fec_2016" {
  account_id        = var.account_id
  name              = "site-fec-2016"
  production_branch = "master"

  lifecycle {
    ignore_changes = [source]
  }
}

# --- Page Rules ---

resource "cloudflare_page_rule" "resume_redirect" {
  zone_id  = var.zone_id
  target   = "resume.hobbes3.com/*"
  status   = "active"
  priority = 1

  actions ={ 
    forwarding_url = {
      status_code = 301
      url         = "https://hobbes3.com/resumes/hobbes3_resume_latest.pdf"
    }
  }
}

# --- CNAME Records ---

resource "cloudflare_dns_record" "records" {
  for_each = var.dns_records
  zone_id  = var.zone_id
  name     = each.value.name
  type     = "CNAME"
  content  = each.value.content
  ttl      = 1
  proxied  = true
}

# --- MX Records ---

resource "cloudflare_dns_record" "mx1" {
  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  content  = "route1.mx.cloudflare.net"
  priority = 40
  ttl      = 1
}

resource "cloudflare_dns_record" "mx2" {
  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  content  = "route2.mx.cloudflare.net"
  priority = 82
  ttl      = 1
}

resource "cloudflare_dns_record" "mx3" {
  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  content  = "route3.mx.cloudflare.net"
  priority = 89
  ttl      = 1
}

# --- TXT Records ---

resource "cloudflare_dns_record" "spf" {
  zone_id = var.zone_id
  name    = "@"
  type    = "TXT"
  content = "v=spf1 include:_spf.mx.cloudflare.net ~all"
  ttl     = 1

  lifecycle {
    ignore_changes = [content, ttl]
  }
}

resource "cloudflare_dns_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc"
  type    = "TXT"
  content = "v=DMARC1; p=none; rua=mailto:0874192e7644485da391ab8d68d1c498@dmarc-reports.cloudflare.net"
  ttl     = 1
}

resource "cloudflare_dns_record" "dkim" {
  zone_id = var.zone_id
  name    = "cf2024-1._domainkey"
  type    = "TXT"
  content = "v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiweykoi+o48IOGuP7GR3X0MOExCUDY/BCRHoWBnh3rChl7WhdyCxW3jgq1daEjPPqoi7sJvdg5hEQVsgVRQP4DcnQDVjGMbASQtrY4WmB1VebF+RPJB2ECPsEDTpeiI5ZyUAwJaVX7r6bznU67g7LvFq35yIo4sdlmtZGV+i0H4cpYH9+3JJ78km4KXwaf9xUJCWF6nxeD+qG6Fyruw1Qlbds2r85U9dkNDVAS3gioCvELryh1TxKGiVTkg4wqHTyHfWsp7KD3WQHYJn0RyfJJu6YEmL77zonn7p2SRMvTMP3ZEXibnC9gz3nnhR6wcYL8Q7zXypKTMD58bTixDSJwIDAQAB"
  ttl     = 1

  lifecycle {
    ignore_changes = [content, ttl]
  }
}

# ==============================================================================
# 3. IMPORT BLOCKS 
# ==============================================================================

import {
  to = cloudflare_pages_project.site
  id = "${var.account_id}/site-resume"
}

import {
  to = cloudflare_pages_project.fec_2016
  id = "${var.account_id}/site-fec-2016"
}

import {
  to = cloudflare_page_rule.resume_redirect
  id = "${var.zone_id}/ee70d6b6bf5e1e9b1d2d0f9ba2618f09"
}

# CNAME Imports
import {
  to = cloudflare_dns_record.records["root"]
  id = "${var.zone_id}/20ae2ce49b22b924ba0775b8f8ec9922"
}

import {
  to = cloudflare_dns_record.records["resume"]
  id = "${var.zone_id}/88a9bbaf8d4bce784da5cbdc33996b25"
}

import {
  to = cloudflare_dns_record.records["fec"]
  id = "${var.zone_id}/7e541d39dd8aecdc80a70cf34481bb7d"
}

import {
  to = cloudflare_dns_record.records["www"]
  id = "${var.zone_id}/299ba9a75a6d567ff266d4f6c735d6f8"
}

# MX Imports
import {
  to = cloudflare_dns_record.mx1
  id = "${var.zone_id}/de7d3e99b596f291f7a29618c64e2215"
}

import {
  to = cloudflare_dns_record.mx2
  id = "${var.zone_id}/3249f68028886830414bb4fc8f95c8e3"
}

import {
  to = cloudflare_dns_record.mx3
  id = "${var.zone_id}/c4b4af39a2b0bc2991c7fc7f754eb3d9"
}

# TXT Imports
import {
  to = cloudflare_dns_record.spf
  id = "${var.zone_id}/2d042ca0971f7afde69f679229209789"
}

import {
  to = cloudflare_dns_record.dmarc
  id = "${var.zone_id}/798ef319a42be8832ee4d944e3d67fac"
}

import {
  to = cloudflare_dns_record.dkim
  id = "${var.zone_id}/7e2fdebaf649ec48e51fafd26c4f3fb7"
}
