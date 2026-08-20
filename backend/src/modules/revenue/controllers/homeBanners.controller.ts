import { Request, Response, NextFunction } from "express";
import { HomeBanner } from "../models/HomeBanner";

export async function getHomeBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.all === "true";
    const typeFilter = req.query.type as string;

    const filter: Record<string, any> = {};
    if (!includeInactive) filter.isActive = true;
    if (typeFilter) filter.type = typeFilter;

    const banners = await HomeBanner.find(filter).sort({ order: 1, createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: banners.map((b) => ({
        id: b.bannerId || b._id.toString(),
        bannerId: b.bannerId,
        type: b.type,
        title: b.title,
        subtitle: b.subtitle,
        tag: b.tag,
        price: b.price,
        originalPrice: b.originalPrice,
        image: b.image,
        sellerName: b.sellerName,
        initials: b.initials,
        location: b.location,
        responseTime: b.responseTime,
        targetUrl: b.targetUrl,
        listingId: b.listingId,
        order: b.order,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createHomeBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      title,
      type,
      subtitle,
      tag,
      price,
      originalPrice,
      image,
      sellerName,
      initials,
      location,
      responseTime,
      targetUrl,
      listingId,
      order,
      isActive
    } = req.body;

    if (!title || !image) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Title and Image are required" }
      });
      return;
    }

    const generatedId = `bnr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const banner = await HomeBanner.create({
      bannerId: generatedId,
      type: type || "hero_showcase",
      title: title.trim(),
      subtitle: subtitle?.trim(),
      tag: tag || "Featured Deal",
      price: price !== undefined ? Number(price) : undefined,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : undefined,
      image,
      sellerName: sellerName || "Verified Seller",
      initials: initials || (sellerName ? sellerName.slice(0, 2).toUpperCase() : "VS"),
      location: location || "Madhapur, Hyderabad",
      responseTime: responseTime || "Responds in < 5 mins",
      targetUrl,
      listingId,
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== false
    });

    res.status(201).json({
      success: true,
      message: "Home banner / hero showcase item created successfully",
      data: banner
    });
  } catch (error) {
    next(error);
  }
}

export async function updateHomeBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const banner = await HomeBanner.findOne({
      $or: [{ bannerId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!banner) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Banner item not found" }
      });
      return;
    }

    const {
      title,
      type,
      subtitle,
      tag,
      price,
      originalPrice,
      image,
      sellerName,
      initials,
      location,
      responseTime,
      targetUrl,
      listingId,
      order,
      isActive
    } = req.body;

    if (title !== undefined) banner.title = title.trim();
    if (type !== undefined) banner.type = type;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (tag !== undefined) banner.tag = tag;
    if (price !== undefined) banner.price = Number(price);
    if (originalPrice !== undefined) banner.originalPrice = Number(originalPrice);
    if (image !== undefined) banner.image = image;
    if (sellerName !== undefined) banner.sellerName = sellerName;
    if (initials !== undefined) banner.initials = initials;
    if (location !== undefined) banner.location = location;
    if (responseTime !== undefined) banner.responseTime = responseTime;
    if (targetUrl !== undefined) banner.targetUrl = targetUrl;
    if (listingId !== undefined) banner.listingId = listingId;
    if (order !== undefined) banner.order = Number(order);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner item updated successfully",
      data: banner
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHomeBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await HomeBanner.deleteOne({
      $or: [{ bannerId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Banner item not found" }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Banner item deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}
