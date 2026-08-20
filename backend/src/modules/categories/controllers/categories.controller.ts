import { Request, Response, NextFunction } from "express";
import { Category } from "../models/Category";
import { Listing } from "../../listings/models/Listing";

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.all === "true" || req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };

    const categories = await Category.find(filter)
      .sort({ row: 1, name: 1 })
      .lean();

    // Aggregate active listing counts per category from MongoDB
    const countsAggregate = await Listing.aggregate([
      { $match: { status: { $ne: "DELETED" } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);

    const countMap: Record<string, number> = {};
    countsAggregate.forEach((item) => {
      if (item._id) {
        countMap[String(item._id).toLowerCase()] = item.count;
      }
    });

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).json({
      success: true,
      data: categories.map((cat) => {
        const key = (cat.categoryId || "").toLowerCase();
        return {
          id: cat.categoryId,
          categoryId: cat.categoryId,
          name: cat.name,
          row: cat.row,
          iconName: cat.iconName || "Layers",
          iconUrl: cat.iconUrl || undefined,
          imageUrl: cat.imageUrl || undefined,
          subcategoriesLabel: cat.subcategoriesLabel || undefined,
          subcategories: cat.subcategories || [],
          filters: cat.filters || [],
          listingCardFields: cat.listingCardFields || [],
          detailsSpecFields: cat.detailsSpecFields || [],
          sellingFormFields: cat.sellingFormFields || [],
          verificationBadges: cat.verificationBadges || [],
          sortOptions: cat.sortOptions || [],
          compareAttributes: cat.compareAttributes || [],
          specialFeatures: cat.specialFeatures || [],
          specFields: cat.specFields || [],
          count: countMap[key] || 0,
          isActive: cat.isActive !== false,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt
        };
      })
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.params.categoryId as string;
    const category = await Category.findOne({
      $or: [{ categoryId }, { _id: categoryId.match(/^[0-9a-fA-F]{24}$/) ? categoryId : null }]
    }).lean();

    if (!category) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `Category "${categoryId}" not found` }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: category.categoryId,
        categoryId: category.categoryId,
        name: category.name,
        row: category.row,
        iconName: category.iconName || "Layers",
        iconUrl: category.iconUrl || undefined,
        imageUrl: category.imageUrl || undefined,
        subcategoriesLabel: category.subcategoriesLabel || undefined,
        subcategories: category.subcategories || [],
        filters: category.filters || [],
        listingCardFields: category.listingCardFields || [],
        detailsSpecFields: category.detailsSpecFields || [],
        sellingFormFields: category.sellingFormFields || [],
        verificationBadges: category.verificationBadges || [],
        sortOptions: category.sortOptions || [],
        compareAttributes: category.compareAttributes || [],
        specialFeatures: category.specialFeatures || [],
        specFields: category.specFields || [],
        isActive: category.isActive !== false,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryFormSchema(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { categoryId } = req.params;
    const category = await Category.findOne({ categoryId, isActive: true }).lean();

    if (!category) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `Category "${categoryId}" not found` }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: category.categoryId,
        categoryId: category.categoryId,
        name: category.name,
        iconName: category.iconName,
        iconUrl: category.iconUrl,
        imageUrl: category.imageUrl,
        subcategoriesLabel: category.subcategoriesLabel || undefined,
        subcategories: category.subcategories || [],
        filters: category.filters || [],
        listingCardFields: category.listingCardFields || [],
        detailsSpecFields: category.detailsSpecFields || [],
        sellingFormFields: category.sellingFormFields || [],
        verificationBadges: category.verificationBadges || [],
        sortOptions: category.sortOptions || [],
        compareAttributes: category.compareAttributes || [],
        specialFeatures: category.specialFeatures || [],
        specFields: category.specFields || []
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      categoryId,
      row,
      iconName,
      iconUrl,
      imageUrl,
      subcategoriesLabel,
      subcategories,
      filters,
      listingCardFields,
      detailsSpecFields,
      sellingFormFields,
      verificationBadges,
      sortOptions,
      compareAttributes,
      specialFeatures,
      specFields,
      isActive
    } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Category name is required" }
      });
      return;
    }

    const generatedId = (categoryId || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await Category.findOne({ categoryId: generatedId });
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: `Category with ID "${generatedId}" already exists` }
      });
      return;
    }

    const newCategory = await Category.create({
      categoryId: generatedId,
      name: name.trim(),
      row: Number(row) === 2 ? 2 : Number(row) === 3 ? 3 : 1,
      iconName: iconName || "Layers",
      iconUrl: iconUrl || undefined,
      imageUrl: imageUrl || undefined,
      subcategoriesLabel: subcategoriesLabel || undefined,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      filters: Array.isArray(filters) ? filters : [],
      listingCardFields: Array.isArray(listingCardFields) ? listingCardFields : [],
      detailsSpecFields: Array.isArray(detailsSpecFields) ? detailsSpecFields : [],
      sellingFormFields: Array.isArray(sellingFormFields) ? sellingFormFields : [],
      verificationBadges: Array.isArray(verificationBadges) ? verificationBadges : [],
      sortOptions: Array.isArray(sortOptions) && sortOptions.length > 0 ? sortOptions : ["Relevance", "Newest First", "Price: Low to High", "Price: High to Low"],
      compareAttributes: Array.isArray(compareAttributes) ? compareAttributes : [],
      specialFeatures: Array.isArray(specialFeatures) ? specialFeatures : [],
      specFields: Array.isArray(specFields) ? specFields : [],
      isActive: isActive !== false
    });

    res.status(201).json({
      success: true,
      message: `Category "${newCategory.name}" created successfully`,
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.params.categoryId as string;
    const category = await Category.findOne({
      $or: [{ categoryId }, { _id: categoryId.match(/^[0-9a-fA-F]{24}$/) ? categoryId : null }]
    });

    if (!category) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `Category "${categoryId}" not found` }
      });
      return;
    }

    const {
      name,
      row,
      iconName,
      iconUrl,
      imageUrl,
      subcategoriesLabel,
      subcategories,
      filters,
      listingCardFields,
      detailsSpecFields,
      sellingFormFields,
      verificationBadges,
      sortOptions,
      compareAttributes,
      specialFeatures,
      specFields,
      isActive
    } = req.body;

    if (name !== undefined) category.name = name.trim();
    if (row !== undefined) category.row = Number(row) === 2 ? 2 : Number(row) === 3 ? 3 : 1;
    if (iconName !== undefined) category.iconName = iconName;
    if (iconUrl !== undefined) category.iconUrl = iconUrl;
    if (imageUrl !== undefined) category.imageUrl = imageUrl;
    if (subcategoriesLabel !== undefined) category.subcategoriesLabel = subcategoriesLabel;
    if (subcategories !== undefined) category.subcategories = Array.isArray(subcategories) ? subcategories : [];
    if (filters !== undefined) category.filters = Array.isArray(filters) ? filters : [];
    if (listingCardFields !== undefined) category.listingCardFields = Array.isArray(listingCardFields) ? listingCardFields : [];
    if (detailsSpecFields !== undefined) category.detailsSpecFields = Array.isArray(detailsSpecFields) ? detailsSpecFields : [];
    if (sellingFormFields !== undefined) category.sellingFormFields = Array.isArray(sellingFormFields) ? sellingFormFields : [];
    if (verificationBadges !== undefined) category.verificationBadges = Array.isArray(verificationBadges) ? verificationBadges : [];
    if (sortOptions !== undefined) category.sortOptions = Array.isArray(sortOptions) ? sortOptions : category.sortOptions;
    if (compareAttributes !== undefined) category.compareAttributes = Array.isArray(compareAttributes) ? compareAttributes : [];
    if (specialFeatures !== undefined) category.specialFeatures = Array.isArray(specialFeatures) ? specialFeatures : [];
    if (specFields !== undefined) category.specFields = Array.isArray(specFields) ? specFields : [];
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" updated successfully`,
      data: category
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.params.categoryId as string;
    const category = await Category.findOne({
      $or: [{ categoryId }, { _id: categoryId.match(/^[0-9a-fA-F]{24}$/) ? categoryId : null }]
    });

    if (!category) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `Category "${categoryId}" not found` }
      });
      return;
    }

    const permanent = req.query.permanent === "true";
    if (permanent) {
      await Category.deleteOne({ _id: category._id });
      res.status(200).json({
        success: true,
        message: `Category "${category.name}" permanently deleted`
      });
    } else {
      category.isActive = false;
      await category.save();
      res.status(200).json({
        success: true,
        message: `Category "${category.name}" disabled successfully`
      });
    }
  } catch (error) {
    next(error);
  }
}
