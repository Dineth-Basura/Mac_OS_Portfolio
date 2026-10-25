---
title: Network Port Scanner
category: Cybersecurity
description: A network reconnaissance toolkit with multiple scan types, service
  detection, OS fingerprinting, and NVD vulnerability assessment.
technologies:
  - Python
  - Threading
  - Socket programming
date: June 2026
order: 1
featured: true
visible: true
repository: https://github.com/Dineth-Basura/Network-port-Scanner
additionalRepositories: []
visual: network
screenshots: []
image: /images/projects/network-port-scanner-v2.webp
imageAlt: Conceptual illustration for Network Port Scanner
imageType: concept
---

## Overview
A Python network reconnaissance tool that brings port scanning, service identification, and vulnerability assessment into one workflow.

## Technical approach
Concurrent threading and socket programming support TCP Connect, SYN, UDP, FIN, XMAS, NULL, and ACK scan types. Protocol-specific probes collect banners from HTTP, SSH, FTP, SMTP, MySQL, and Redis services.

## Features
- Service detection through banner grabbing.
- OS fingerprinting using TTL and TCP window analysis.
- Vulnerability assessment through the NIST NVD API.

## Architecture
Scan targets → concurrent socket probes → service banners and OS indicators → NVD vulnerability lookup.

