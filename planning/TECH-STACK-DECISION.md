# Tech Stack Decision Record

## Context
The application begins in a blank folder and is intended first as a UI prototype based on Google Stitch designs. Production integration target is not available in this workspace.

## Proposed decision for Phase A only
- React + TypeScript + Vite
- Tailwind CSS
- React Router (if route-based screens are required)
- Local synthetic mock data behind isolated adapters

## Why
Fast iteration across multiple Student/Admin screens; type-safe UI models; practical handoff from generated frontend artifacts; straightforward local run for review.

## Explicitly not decided
- Backend language/framework
- API protocol/contracts and authentication
- Database and file object storage
- OCR product/library
- LLM provider/model/API
- Prompt or model configuration
- Deployment environment

## Approval gate
Do not start Phase B/C until:
1. the UI design is approved;
2. key data model and flow are agreed;
3. integration/security/privacy needs are specified;
4. provider choices and costs are reviewed;
5. acceptance and evaluation plan is approved.

## Decision history
Initial recommendation only. User/team may replace it after technical review.
